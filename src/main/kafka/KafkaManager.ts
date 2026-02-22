import KafkaClusterService from '@main/db/service/KafkaClusterService'
import SASLConfService from '@main/db/service/SASLService'
import {
    IKafkaMessage,
    KafkaActionResult,
    KafkaActionResultFetchMessage,
    KafkaActionResultFetchTopics,
    KafkaActionPayloadBase,
    KafkaActionPayloadFetchMessage,
    KafkaActionResultClearClient
} from '@shared/types'
import { BrowserWindow } from 'electron'
import { Kafka, KafkaConfig, SASLOptions } from 'kafkajs'
import _ from 'lodash'

export default class KafkaManager {
    private readonly kafkaClients = new Map<number, Kafka>()
    private readonly kafkaClusterService = KafkaClusterService.instance()
    private readonly saslConfService = SASLConfService.instance()

    async getKafkaClient(clusterId: number): Promise<Kafka | null> {
        if (this.kafkaClients.get(clusterId)) {
            return this.kafkaClients.get(clusterId)!
        }
        const cluster = await this.kafkaClusterService.findOneById(clusterId)
        if (!cluster) {
            console.log(`No cluster with id: ${clusterId}`)
            return null
        }
        console.log('cluster: ', cluster)
        const saslConf = await this.saslConfService.findFirstBy({ clusterId })
        console.log('saslConf: ', saslConf)
        const kafkaConfig: KafkaConfig = {
            clientId: cluster.clientId || 'kafka-shake_' + new Date().getTime(),
            brokers: cluster.brokers,
            ssl: cluster.useSSL
        }
        if (cluster.saslMechanism != 'none') {
            if (cluster.saslMechanism == 'oauthbearer') {
                kafkaConfig.sasl = {
                    mechanism: 'oauthbearer',
                    oauthBearerProvider: async () => {
                        return {
                            value: saslConf.token
                        }
                    }
                }
            } else {
                kafkaConfig.sasl = {
                    mechanism: cluster.saslMechanism,
                    username: saslConf.username,
                    password: saslConf.password
                } as SASLOptions
            }
        }
        const kafka = new Kafka(kafkaConfig)
        return kafka
    }

    clearKafkaClient(clusterId: number): KafkaActionResultClearClient {
        console.log('Clear client for clust: ', clusterId)
        this.kafkaClients.delete(clusterId)
        return {
            clusterId,
            action: 'clear-client',
            sucess: true
        }
    }

    async fetchTopics({
        clusterId
    }: KafkaActionPayloadBase): Promise<KafkaActionResultFetchTopics> {
        console.log('fetch topics ...')
        const kafka = await this.getKafkaClient(clusterId)
        const result: KafkaActionResultFetchTopics = {
            action: 'fetch-topics',
            sucess: true,
            clusterId,
            topics: []
        }
        if (!kafka) {
            result.sucess = false
            result.errMsg = 'Kafka cluster was not found'
            console.error(`No kafka cluster with id ${clusterId}`)
            return result
        }
        try {
            const admin = kafka!.admin()
            await admin.connect()
            const topics = await admin.listTopics()
            result.topics = topics.filter((t) => !t.startsWith('__consumer_offsets'))
            console.log('topic list: ', topics)
            await admin.disconnect()
            return result
        } catch (e: unknown) {
            result.sucess = false
            result.errMsg = `Fetch topics errored: ${(e as Error).message}`
            return result
        }
    }

    async fetchMessage({
        direction,
        count,
        topic,
        clusterId
    }: KafkaActionPayloadFetchMessage): Promise<KafkaActionResultFetchMessage> {
        const kafka = await this.getKafkaClient(clusterId)
        const result: KafkaActionResultFetchMessage = {
            action: 'fetch-message',
            sucess: true,
            clusterId,
            topic,
            messages: []
        }
        if (!kafka) {
            result.sucess = false
            result.errMsg = 'Kafka cluster was not found'
            console.error(`No kafka cluster with id ${clusterId}`)
            return result
        }
        const admin = kafka!.admin()
        await admin.connect()
        const topicOffsets = await admin.fetchTopicOffsets(topic)
        await admin.disconnect()

        if (topicOffsets.length === 0) {
            result.sucess = false
            result.errMsg = `Offsets of topic ${topic} is empty`
            console.log('topicOffsets lent is 0 ...')
            return result
        }

        const fetchPromises = topicOffsets.map(async (partitionInfo) => {
            const partition = partitionInfo.partition
            const low = parseInt(partitionInfo.low)
            const high = parseInt(partitionInfo.high)

            let startOffset: number
            let stopOffset: number
            if (direction === 'oldest') {
                startOffset = low
                stopOffset = Math.min(startOffset + count, high)
            } else {
                startOffset = Math.max(low, high - count)
                stopOffset = Math.min(startOffset + count, high)
            }
            console.log(`offset range: `, startOffset, stopOffset)

            if (startOffset == stopOffset) {
                console.log('startOffset = stopOffset, resolved empty ...')
                return new Promise<IKafkaMessage[]>((resolve, __) => resolve([]))
            }
            const groupId = `kafka-shake-fetch-${topic}-${partition}-${Date.now()}-${Math.random()}`
            const consumer = kafka!.consumer({ groupId, sessionTimeout: 30 * 1000 })
            await consumer.connect()
            await consumer.subscribe({ topic, fromBeginning: false })

            const messages: IKafkaMessage[] = []
            let receivedCount = 0
            let resolvePromise: (value: IKafkaMessage[]) => void
            let rejectPromise: (reason?: unknown) => void
            const promise = new Promise<IKafkaMessage[]>((resolve, reject) => {
                resolvePromise = resolve
                rejectPromise = reject
            })

            const timeout = setTimeout(() => {
                consumer.disconnect().catch(() => {})
                rejectPromise(new Error(`Fetch timeout for partition ${partition}`))
            }, 30 * 1000)

            const maxOffset = stopOffset == high ? high - 1 : stopOffset
            console.log('maxOffset: ', maxOffset)
            let messageOffset: number = -1
            await consumer.run({
                eachMessage: async ({ message }) => {
                    console.log('message: ', message)
                    messages.push({
                        partition,
                        offset: message.offset,
                        key: message.key?.toString() || '',
                        value: message.value?.toString() || '',
                        timestamp: message.timestamp
                        // headers: message.headers
                    })
                    receivedCount++
                    messageOffset = parseInt(message.offset)
                    if (messageOffset >= maxOffset || receivedCount >= count) {
                        clearTimeout(timeout)
                        console.log('timeout cleared ...')
                        consumer.pause([{ topic, partitions: [partition] }])
                        setImmediate(async () => {
                            console.log('partition finished, clear ...')
                            await consumer.stop()
                            console.log('consumer stoped ...')
                            await consumer.disconnect()
                            console.log('consumer disconnected ...')
                            resolvePromise(messages)
                        })
                    }
                }
            })
            consumer.seek({ topic, partition, offset: startOffset.toString() })
            return promise
        })

        const results = await Promise.allSettled(fetchPromises)
        // console.log('results: ', JSON.stringify(results))
        const allMessages: IKafkaMessage[] = []
        const erroredPatitions: number[] = []
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allMessages.push(...result.value)
            } else {
                console.error(
                    `Failed to fetch from partition ${topicOffsets[index].partition}:`,
                    result.reason
                )
                erroredPatitions.push(topicOffsets[index].partition)
            }
        })
        allMessages.sort((a, b) => {
            if (a.partition !== b.partition) return a.partition - b.partition
            return parseInt(a.offset) - parseInt(b.offset)
        })
        result.messages = allMessages
        if (erroredPatitions.length) {
            result.sucess = false
            result.errMsg = `Fetch messages from partition ${erroredPatitions.join('、')} timeout`
        }
        return result
    }

    handleWokerMessage(message: KafkaActionResult) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(message.action, message)
        })
    }
}

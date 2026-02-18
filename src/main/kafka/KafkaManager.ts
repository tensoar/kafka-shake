import KafkaClusterService from '@main/db/service/KafkaClusterService'
import SASLConfService from '@main/db/service/SASLService'
import {
    IKafkaMessage,
    KafkaWokerMessage,
    KafkaWokerMessageFetchMessage,
    KafkaWokerPayloadFetchMessage,
    KafkaWorkerPayload
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

    async fetchMessage({
        action,
        offset,
        direction,
        count,
        topic,
        clusterId
    }: KafkaWokerPayloadFetchMessage): Promise<KafkaWokerMessageFetchMessage> {
        const kafka = await this.getKafkaClient(clusterId)
        if (!kafka) {
            console.error(`No kafka cluster with id ${clusterId}`)
        }
        const result: KafkaWokerMessageFetchMessage = {
            action: 'fetch-message',
            clusterId,
            topic,
            messages: []
        }
        const admin = kafka!.admin()
        await admin.connect()
        const topicOffsets = await admin.fetchTopicOffsets(topic)
        await admin.disconnect()

        if (topicOffsets.length === 0) {
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
        console.log('results: ', results)
        const allMessages: IKafkaMessage[] = []
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allMessages.push(...result.value)
            } else {
                console.error(
                    `Failed to fetch from partition ${topicOffsets[index].partition}:`,
                    result.reason
                )
            }
        })

        allMessages.sort((a, b) => {
            if (a.partition !== b.partition) return a.partition - b.partition
            return parseInt(a.offset) - parseInt(b.offset)
        })
        result.messages = allMessages
        return result
    }

    handleWokerMessage(message: KafkaWokerMessage) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(message.action, message)
        })
    }
}

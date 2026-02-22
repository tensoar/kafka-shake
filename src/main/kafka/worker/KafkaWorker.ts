import { KafkaWokerData } from '@main/types'
import { IKafkaMessage, KafkaActionResult, KafkaActionResultFetchMessage, KafkaActionPayloadFetchMessage, KafkaActionPayload } from '@shared/types'
import { Consumer, Kafka, KafkaConfig, SASLOptions } from 'kafkajs'
import { parentPort, workerData } from 'worker_threads'
import _ from 'lodash'

const { cluster, saslConf } = workerData as KafkaWokerData
let kafka: Kafka | null = null
const consumers = new Map<string, Consumer>()

async function initKafka() {
    if (!kafka) {
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
        console.log("new kafka ......")
        kafka = new Kafka(kafkaConfig)
        return kafka
    }
}

async function startConsumer(topic: string) {
    if (!kafka) {
        await initKafka()
    }
    // TODO
}

async function fetchMessage({
    action,
    offset,
    direction,
    count,
    topic
}: KafkaActionPayloadFetchMessage) {
    if (!kafka) {
        await initKafka()
    }

    let startOffset: number
    if (!_.isNil(offset)) {
        startOffset = offset
    } else {
        const admin = kafka!.admin()
        await admin.connect()
        const topicOffsets = await admin.fetchTopicOffsets(topic)
        await admin.disconnect()

        if (topicOffsets.length === 0) {
            return []
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
                    if (parseInt(message.offset) >= stopOffset || receivedCount >= count) {
                        clearTimeout(timeout)
                        await consumer.stop()
                        await consumer.disconnect()
                        resolvePromise(messages)
                    }
                }
            })

            consumer.seek({ topic, partition, offset: startOffset.toString() })
            return promise
        })

        const results = await Promise.allSettled(fetchPromises)
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

        return allMessages
    }
}

async function disconnect() {
    for (const [topic, consumer] of consumers) {
        try {
            await consumer.disconnect()
        } catch (e) {
            console.log(e)
        }
    }
    consumers.clear()
    process.exit(0)
}

parentPort?.on('message', async (payload: KafkaActionPayload) => {
    try {
        let result: KafkaActionResult
        if (payload.action == 'fetch-message') {
            const messages = await fetchMessage(payload)
            result = {
                clusterId: payload.clusterId,
                topic: payload.topic,
                messages: messages || []
            } as KafkaActionResultFetchMessage
        } else {
            result = {
                clusterId: payload.clusterId,
                topic: payload.topic,
                messages: []
            } as unknown as KafkaActionResultFetchMessage
        }
        parentPort?.postMessage(result)
    } catch (e) {
        console.log(e)
    }
})

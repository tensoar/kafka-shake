export type Mechainsm = 'plain' | 'scram-sha-256' | 'scram-sha-512' | 'oauthbearer'

export type SSLSourceType = 'file' | 'value'

export interface IKafkaMessage {
    offset: string
    partition: number
    key: string
    value: string
    timestamp: string
}

export interface IKafkaMessageDiaptchType {
    topicId: string
    message: IKafkaMessage | IKafkaMessage[]
}

export type KafkaWorkerAction =
    | 'fetch-message'
    | 'disconnect'
    | 'start-consumer'
    | 'stop-consumer'
    | 'fetch-topics'

export interface KafkaWokerPayloadBase {
    clusterId: number
}

export interface KafkaWokerPayloadStartConsumer extends KafkaWokerPayloadBase {
    action: 'start-consumer'
    topic: string
}

export interface KafkaWokerPayloadFetchMessage extends KafkaWokerPayloadBase {
    action: 'fetch-message'
    offset?: number
    direction: 'latest' | 'oldest'
    count: number
    topic: string
}

export interface KafkaWokerPayloadFectchTopics extends KafkaWokerPayloadBase {
    action: 'fetch-topics'
}

export type KafkaWorkerPayload =
    | KafkaWokerPayloadStartConsumer
    | KafkaWokerPayloadFetchMessage
    | KafkaWokerPayloadFectchTopics

export interface KafkaWokerMessageBase {
    clusterId: number
}

export interface KafkaWokerMessageStartConsumer extends KafkaWokerMessageBase {
    action: 'start-consumer'
    topic: string
    success: boolean
}

export interface KafkaWokerMessageFetchMessage extends KafkaWokerMessageBase {
    action: 'fetch-message'
    topic: string
    messages: IKafkaMessage[]
}

export interface KafkaWokerMessageFetchTopics extends KafkaWokerMessageBase {
    action: 'fetch-topics'
    topics: string[]
}

export type KafkaWokerMessage = KafkaWokerMessageStartConsumer | KafkaWokerMessageFetchMessage | KafkaWokerMessageFetchTopics

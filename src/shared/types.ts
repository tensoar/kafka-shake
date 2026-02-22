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

export type KafkaAction =
    | 'fetch-message'
    | 'disconnect'
    | 'start-consumer'
    | 'stop-consumer'
    | 'fetch-topics'

export interface KafkaActionPayloadBase {
    clusterId: number
}

export interface KafkaActionPayloadStartConsumer extends KafkaActionPayloadBase {
    action: 'start-consumer'
    topic: string
}

export interface KafkaActionPayloadFetchMessage extends KafkaActionPayloadBase {
    action: 'fetch-message'
    offset?: number
    direction: 'latest' | 'oldest'
    count: number
    topic: string
}

export interface KafkaActionPayloadFectchTopics extends KafkaActionPayloadBase {
    action: 'fetch-topics'
}

export interface KafkaActionPayloadClearClient extends KafkaActionPayloadBase {
    action: 'clear-client'
}

export type KafkaActionPayload =
    | KafkaActionPayloadStartConsumer
    | KafkaActionPayloadFetchMessage
    | KafkaActionPayloadFectchTopics
    | KafkaActionPayloadClearClient

export interface KafkaActionResultBase {
    clusterId: number
    sucess: boolean
    errMsg?: string
}

export interface KafkaActionResultStartConsumer extends KafkaActionResultBase {
    action: 'start-consumer'
    topic: string
    success: boolean
}

export interface KafkaActionResultFetchMessage extends KafkaActionResultBase {
    action: 'fetch-message'
    topic: string
    messages: IKafkaMessage[]
}

export interface KafkaActionResultFetchTopics extends KafkaActionResultBase {
    action: 'fetch-topics'
    topics: string[]
}

export interface KafkaActionResultClearClient extends KafkaActionResultBase {
    action: 'clear-client'
}

export type KafkaActionResult =
    | KafkaActionResultStartConsumer
    | KafkaActionResultFetchMessage
    | KafkaActionResultFetchTopics
    | KafkaActionResultClearClient

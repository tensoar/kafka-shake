import AbsKafkaCluster from '@shared/entity/AbsKafkaCluster'
import AbsSASALConf from '@shared/entity/AbsSASALConf'
import { KafkaAction } from '@shared/types'

export interface KafkaWokerData {
    cluster: AbsKafkaCluster
    saslConf: AbsSASALConf
}

export interface KafkaWokerMessage {
    action: KafkaAction
    data: unknown
}

import IBaseService from './IBaseService'
import KafkaCluster from '@main/entity/KafkaCluster'
import AbsKafkaCluster from '@shared/entity/AbsKafkaCluster'

export default interface IKafkaClusterService extends IBaseService<AbsKafkaCluster, KafkaCluster> {}

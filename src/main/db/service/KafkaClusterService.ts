import BaseService from './BaseService'
import KafkaCluster from '../../entity/KafkaCluster'
import AbsKafkaCluster from '@shared/entity/AbsKafkaCluster'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'

export default class KafkaClusterService
    extends BaseService<AbsKafkaCluster, KafkaCluster>
    implements IKafkaClusterService
{
    private static _instance: KafkaClusterService | null = null

    constructor() {
        super(KafkaCluster)
    }

    static instance(): KafkaClusterService {
        if (KafkaClusterService._instance == null) {
            KafkaClusterService._instance = new KafkaClusterService()
        }
        return KafkaClusterService._instance as KafkaClusterService
    }
}

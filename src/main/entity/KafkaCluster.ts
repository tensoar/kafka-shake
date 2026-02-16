import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import IKafkaCluster from '@shared/entity/AbsKafkaCluster'

@Entity({ name: 'kafka_cluster' })
export default class KafkaCluster implements IKafkaCluster {
    @PrimaryGeneratedColumn({ type: 'integer' })
    id?: number

    @Column({ type: 'text', name: 'cluster_name' })
    clusterName: string = ''

    @Column({ type: 'simple-array' })
    brokers: string[] = []

    @Column({ name: 'client_id', type: 'text' })
    clientId: string = ''

    @Column({ name: 'use_ssl', type: 'integer' })
    useSSL: boolean = false

    @Column({ name: 'sasl', type: 'text' })
    saslMechanism: 'none' | 'plain' | 'scram-sha-256' | 'scram-sha-512' = 'none'
}

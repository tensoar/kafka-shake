import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import IKafkaCluster from '@shared/entity/AbsKafkaCluster'

@Entity({ name: 'kafka_cluster' })
export default class KafkaCluster implements IKafkaCluster {
    @PrimaryGeneratedColumn({ type: 'integer' })
    id?: number

    @Column({ type: 'simple-array' })
    brokers: string[] = []

    @Column({ name: 'client_id', type: 'text' })
    clientId: string = ''

    @Column({ name: 'use_ssl', type: 'integer' })
    useSSL: boolean = false
}

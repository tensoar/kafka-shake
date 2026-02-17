import AbsSASALConf from '@shared/entity/AbsSASALConf'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'sasl_conf' })
export default class SASALConf implements AbsSASALConf {
    @PrimaryGeneratedColumn({ name: 'id', type: 'integer' })
    id?: number

    @Column({ name: 'cluster_id', type: 'integer' })
    clusterId: number = 0

    @Column({ name: 'username', type: 'text' })
    username: string = ''

    @Column({ name: 'password', type: 'text' })
    password: string = ''

    @Column({ name: 'token', type: 'text' })
    token: string = ''
}

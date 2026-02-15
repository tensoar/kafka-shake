import ISASLConf from '@shared/entity/ISASLConf'
import { Mechainsm } from '@shared/types'
import { Entity } from 'typeorm'

@Entity({ name: 'sasal_conf'})
export default class SASALConf implements ISASLConf {
    id?: number
    clusterId: number = 0
    mechanism: Mechainsm = 'plain'
    username: string = ''
    password: string = ''
    token: string = ''
}

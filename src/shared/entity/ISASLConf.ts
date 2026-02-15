import { Mechainsm } from '../types'

export default interface ISASALConf {
    id?: number
    clusterId: number
    mechanism: Mechainsm
    username: string
    password: string
    token: string
}

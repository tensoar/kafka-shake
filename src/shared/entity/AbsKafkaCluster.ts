import Identifiable from './Identifiable'

export default abstract class AbsKafkaCluster implements Identifiable {
    abstract id?: number
    abstract brokers: string[]
    abstract clientId: string
    abstract useSSL: boolean

    static createDefault(): AbsKafkaCluster {
        return {
            brokers: [],
            clientId: '',
            useSSL: false
        }
    }
}

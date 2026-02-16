import Identifiable from './Identifiable'

export default abstract class AbsKafkaCluster implements Identifiable {
    abstract id?: number
    abstract clusterName: string
    abstract brokers: string[]
    abstract clientId: string
    abstract useSSL: boolean
    abstract saslMechanism: 'none' | 'plain' | 'scram-sha-256' | 'scram-sha-512'

    static createDefault(): AbsKafkaCluster {
        return {
            clusterName: '',
            brokers: [],
            clientId: '',
            useSSL: false,
            saslMechanism: 'none'
        }
    }
}

import { FormInstance } from 'antd'

export interface ClusterFormValues {
    clusterName: string
    brokers: string[]
    useSSL: boolean
    clientId: string
    saslMechanism: 'none' | 'plain' | 'scram-sha-256' | 'scram-sha-512' | 'oauthbearer'
    saslUsername?: string
    saslPassword?: string
}

export interface ClusterFormProps {
    form: FormInstance<ClusterFormValues>
    onfinish: (value: ClusterFormValues) => void
    type: 'add' | 'update'
    loading?: boolean
}

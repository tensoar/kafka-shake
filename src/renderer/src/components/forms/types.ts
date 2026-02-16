import { FormInstance } from "antd"

export interface AddClusterFormValues {
    clusterName: string
    brokers: string[]
    useSSL: boolean
    clientId: string
    saslMechanism: 'none' | 'plain' | 'scram-sha-256' | 'scram-sha-512'
    saslUsername?: string
    saslPassword?: string
}

export interface AddClusterFormProps {
    form: FormInstance<AddClusterFormValues>
    onfinish: (value: AddClusterFormValues) => void
    loading?: boolean
}

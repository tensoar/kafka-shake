import { useParams } from 'react-router'
import { useState } from 'react'
import ServiceProxy from '@renderer/util/ServiceProxy'
import { ServiceName } from '@shared/service/Constants'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'
import ISASLConfService from '@shared/service/ISASLConfService'
import { Form, App as AntApp } from 'antd'
import { ClusterFormValues } from '../forms/types'
import { useCallback, useEffect } from 'react'
import ClusterForm from '../forms/AddClusterForm'
import AbsSASALConf from '@shared/entity/AbsSASALConf'

const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(
    ServiceName.KAFKA_CLUSTER_SERVICE
)
const saslConfService = ServiceProxy.get<ISASLConfService>(ServiceName.SASL_CONF_SERVICE)

export default function ClusterMain() {
    const { clusterId } = useParams<{ clusterId: string }>()
    const { message } = AntApp.useApp()

    const [clusterForm] = Form.useForm<ClusterFormValues>()
    const [clusterFormLoading, setClusterFormLoading] = useState(false)

    useEffect(() => {
        const setFieldValues = async () => {
            const id = parseInt(clusterId as string)
            const [cluster, saslConf] = await Promise.all([
                kafkaClusterService.findOneById(id),
                saslConfService.findFirstBy({ clusterId: id })
            ])
            const formValue: ClusterFormValues = {
                clusterName: '',
                brokers: [],
                useSSL: false,
                clientId: '',
                saslMechanism: 'none',
                saslUsername: '',
                saslPassword: ''
            }
            if (cluster) {
                formValue.clusterName = cluster.clusterName
                formValue.brokers = cluster.brokers
                formValue.useSSL = cluster.useSSL
                formValue.clientId = cluster.clientId
                formValue.saslMechanism = cluster.saslMechanism
            }
            if (saslConf) {
                formValue.saslUsername = saslConf.username
            }
            clusterForm.setFieldsValue(formValue)
        }
        setFieldValues()
    }, [clusterForm, clusterId])

    const onClusterFormFinished = useCallback(
        async (formValue: ClusterFormValues) => {
            const id = parseInt(clusterId as string)
            setClusterFormLoading(true)
            try {
                const [cluster, saslConf] = await Promise.all([
                    kafkaClusterService.findOneById(id),
                    saslConfService.findFirstBy({ clusterId: id })
                ])
                cluster!.brokers = formValue.brokers
                cluster!.clientId = formValue.clientId || ''
                cluster!.clusterName = formValue.clusterName
                cluster!.saslMechanism = formValue.saslMechanism
                cluster!.useSSL = formValue.useSSL
                console.log('cluster: ', cluster)
                const clusterAdded = await kafkaClusterService.saveOne(cluster!)
                if (cluster!.saslMechanism !== 'none') {
                    const saslConfToUpdate = saslConf || AbsSASALConf.createDefault()
                    saslConfToUpdate.clusterId = clusterAdded.id!
                    saslConfToUpdate.username = formValue.saslUsername!
                    if (formValue.saslPassword) {
                        saslConfToUpdate.password = formValue.saslPassword!
                    }
                    await saslConfService.saveOne(saslConfToUpdate)
                }
                await window.api.callKafkaAction({
                    clusterId: id,
                    action: 'clear-client'
                })
                message.success('Update kafka cluster success')
                console.log('cluster: ', clusterAdded)
            } catch (e: unknown) {
                console.log(e)
                message.error(`Update cluster errored: ${(e as Error).message}`)
            } finally {
                setClusterFormLoading(false)
            }
        },
        [clusterId, message]
    )

    return (
        <div>
            <ClusterForm
                type="update"
                form={clusterForm}
                onfinish={onClusterFormFinished}
                loading={clusterFormLoading}
            />
        </div>
    )
}

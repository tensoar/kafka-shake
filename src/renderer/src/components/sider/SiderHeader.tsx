import { Button, Col, Form, message, Modal, Row, Space, theme, Tooltip, Typography } from 'antd'
import {
    DeleteOutlined,
    GithubOutlined,
    MoonOutlined,
    PlusOutlined,
    SunOutlined
} from '@ant-design/icons'
import KafkaFullLogo from '../svg/KafkaFullLogo'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { actions } from '@renderer/redux/actions'
import _ from 'lodash'
import { useState } from 'react'
import AddClusterForm from '../forms/AddClusterForm'
import { AddClusterFormValues } from '../forms/types'
import AbsKafkaCluster from '@shared/entity/AbsKafkaCluster'
import ServiceProxy from '@renderer/util/ServiceProxy'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'
import { ServiceName } from '@shared/service/Constants'

export default function SiderHeader(): React.JSX.Element {
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken()
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)
    const dispatch = useDispatch()
    const reversedThemeStyle = themeStyle === 'light' ? 'dark' : 'light'
    const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(
        ServiceName.KAFKA_CLUSTER_SERVICE
    )

    const [addClusterForm] = Form.useForm<AddClusterFormValues>()
    const [addClusterModeOpen, setAddClusterModeOpen] = useState(false)
    const [addClusterFormLoading, setAddClusterFormLoading] = useState(false)

    const onAddClusterFormFinished = async (formValue: AddClusterFormValues) => {
        console.log('formValue: ', formValue)
        setAddClusterFormLoading(true)
        const cluster = AbsKafkaCluster.createDefault()
        cluster.brokers = formValue.brokers
        cluster.clientId = formValue.clientId || ''
        cluster.clusterName = formValue.clusterName
        cluster.saslMechanism = formValue.saslMechanism
        cluster.useSSL = formValue.useSSL
        console.log('cluster: ', cluster)

        try {
            const clusterAdded = await kafkaClusterService.saveOne(cluster)
            message.success('Add kafka cluster success')
            console.log('cluster: ', clusterAdded)
            dispatch(actions.kafkaCluster.addCluster(clusterAdded))
        } catch (e: unknown) {
            console.log(e)
            message.error(`Add cluster errored: ${e}`)
        } finally {
            setAddClusterFormLoading(false)
            setAddClusterModeOpen(false)
        }
    }

    return (
        <div
            style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                paddingBottom: 15
            }}
        >
            <Row style={{ width: '100%' }} justify="center" align="middle">
                <Col>
                    <KafkaFullLogo height="100px" width="100px" color="#0c4b29" />
                </Col>
                <Col>
                    <Typography.Title
                        italic={true}
                        level={4}
                        style={{ marginTop: 5, color: '#0c4b29', fontWeight: 660 }}
                    >
                        Shake
                    </Typography.Title>
                </Col>
            </Row>
            <Space
                size="small"
                style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    display: 'flex',
                    marginTop: -25
                }}
            >
                <Tooltip title="Add New Cluster">
                    <Button
                        icon={<PlusOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                        onClick={() => setAddClusterModeOpen(true)}
                    />
                </Tooltip>
                <Tooltip title="Delete Selected Brokers">
                    <Button
                        icon={<DeleteOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                    />
                </Tooltip>
                <Tooltip title={`Change To ${_.upperFirst(reversedThemeStyle)} Mode`}>
                    <Button
                        icon={themeStyle === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                        onClick={() => dispatch(actions.theme.setThemeStyle(reversedThemeStyle))}
                    />
                </Tooltip>
                <Tooltip title="Open Github">
                    <Button
                        icon={<GithubOutlined />}
                        shape="square"
                        size="small"
                        style={{ borderRadius: '20%' }}
                        onClick={() => window.open('https://github.com/tensoar')}
                    />
                </Tooltip>
            </Space>

            <Modal
                open={addClusterModeOpen}
                footer={null}
                title="Add New Kafka Cluster"
                onCancel={() => setAddClusterModeOpen(false)}
                width={800}
                style={{ paddingTop: 10 }}
            >
                <AddClusterForm
                    form={addClusterForm}
                    onfinish={onAddClusterFormFinished}
                    loading={addClusterFormLoading}
                />
            </Modal>
        </div>
    )
}

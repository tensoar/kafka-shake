import {
    Button,
    Col,
    Form,
    Modal,
    Popconfirm,
    Row,
    Space,
    theme,
    Tooltip,
    Typography,
    App as AntApp
} from 'antd'
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
import ClusterForm from '../forms/AddClusterForm'
import { ClusterFormValues } from '../forms/types'
import AbsKafkaCluster from '@shared/entity/AbsKafkaCluster'
import ServiceProxy from '@renderer/util/ServiceProxy'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'
import { ServiceName } from '@shared/service/Constants'
import AbsSASALConf from '@shared/entity/AbsSASALConf'
import ISASLConfService from '@shared/service/ISASLConfService'

export type SiderHeaderProps = {
    checkedClusterKeys: number[]
}

export default function SiderHeader({ checkedClusterKeys }: SiderHeaderProps): React.JSX.Element {
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken()
    const { message } = AntApp.useApp()
    const themeStyle = useSelector((state: RootState) => state.theme.themeStyle)
    const dispatch = useDispatch()
    const reversedThemeStyle = themeStyle === 'light' ? 'dark' : 'light'
    const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(
        ServiceName.KAFKA_CLUSTER_SERVICE
    )
    const saslConfService = ServiceProxy.get<ISASLConfService>(ServiceName.SASL_CONF_SERVICE)

    const [addClusterForm] = Form.useForm<ClusterFormValues>()
    const [addClusterModeOpen, setAddClusterModeOpen] = useState(false)
    const [addClusterFormLoading, setAddClusterFormLoading] = useState(false)

    const onAddClusterFormFinished = async (formValue: ClusterFormValues) => {
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
            if (cluster.saslMechanism !== 'none') {
                const saslConf = AbsSASALConf.createDefault()
                saslConf.clusterId = clusterAdded.id!
                saslConf.username = formValue.saslUsername!
                saslConf.password = formValue.saslPassword!
                await saslConfService.saveOne(saslConf)
            }
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

    const deleteClusters = async () => {
        if (checkedClusterKeys.length < 1) {
            message.info('No cluster select')
            return
        }
        await kafkaClusterService.deleteById(checkedClusterKeys)
        dispatch(actions.kafkaCluster.removeCluster(checkedClusterKeys))
        message.info('Cluster was deleted')
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
                    <Popconfirm
                        title="Delete cluster"
                        description={`Confirm to delete ${checkedClusterKeys.length} selected clusters?`}
                        onConfirm={deleteClusters}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            shape="square"
                            size="small"
                            danger
                            style={{ borderRadius: '20%' }}
                        />
                    </Popconfirm>
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
                        onClick={() => window.open('https://github.com/tensoar/kafka-shake')}
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
                <ClusterForm
                    type="add"
                    form={addClusterForm}
                    onfinish={onAddClusterFormFinished}
                    loading={addClusterFormLoading}
                />
            </Modal>
        </div>
    )
}

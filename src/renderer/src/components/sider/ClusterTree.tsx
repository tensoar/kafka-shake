import { Button, Space, Tooltip, Tree, TreeProps, App as AntApp } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { SyncOutlined } from '@ant-design/icons'
import ServiceProxy from '@renderer/util/ServiceProxy'
import { ServiceName } from '@shared/service/Constants'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@renderer/redux/store'
import { actions } from '@renderer/redux/actions'
import { ClusterTreeNode } from './types'
import { useNavigate } from 'react-router'
import { KafkaActionResultFetchTopics } from '@shared/types'

export type ClusterTreeProps = {
    onClusterChecked: TreeProps['onCheck']
}

export default function ClusterTree({ onClusterChecked }: ClusterTreeProps): React.JSX.Element {
    const treeData = useSelector((rootState: RootState) => rootState.kafkaCluster.clustersTree)
    const { message } = AntApp.useApp()
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
    const [refreshLoading, setRefreshLoading] = useState(false)
    const navigate = useNavigate()
    const dispath = useDispatch()
    const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(
        ServiceName.KAFKA_CLUSTER_SERVICE
    )

    const onClusterClick = (__, node: ClusterTreeNode) => {
        console.log(node)
        if (node.type === 'topic-item') {
            const key = node.key.toString()
            const spliteIndex = key.indexOf(':')
            const topic = key.substring(spliteIndex + 1)
            const clusterId = key.substring(0, spliteIndex)
            navigate(`cluster/topic/${clusterId}/${topic}`)
        } else if (node.type === 'cluster-info') {
            const key = node.key.toString()
            const spliteIndex = key.indexOf('-')
            const clusterId = parseInt(key.slice(spliteIndex + 1))
            navigate(`cluster/info/${clusterId}`)
        }
    }

    const titleRender = (node: ClusterTreeNode): React.ReactNode => {
        if (node.type === 'cluster-topic') {
            return (
                <div>
                    <Space size="small">
                        <span>{node.title as string}</span>
                        <Tooltip title="Refresh Topics">
                            <Button
                                icon={<SyncOutlined />}
                                type="text"
                                size="small"
                                loading={refreshLoading}
                                onClick={async (e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    await refreshTopics(node)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                            />
                        </Tooltip>
                    </Space>
                </div>
            )
        } else {
            return <span>{node.title as string}</span>
        }
    }

    const refreshTopics = useCallback(
        async (node: ClusterTreeNode) => {
            const key = node.key
            try {
                if (node.type !== 'cluster-topic') {
                    return
                }
                const clusterId = parseInt((key as string).split('-')[1])
                setRefreshLoading(true)
                const result = (await window.api.callKafkaAction({
                    clusterId: clusterId,
                    action: 'fetch-topics'
                })) as KafkaActionResultFetchTopics
                console.log('fetch topics result: ', result)
                if (!result.sucess) {
                    message.error(result.errMsg)
                    setExpandedKeys((prev) => prev.filter((k) => k !== node.key))
                    throw Error(result.errMsg)
                }
                dispath(
                    actions.kafkaCluster.setClusterTopics({
                        clusterId: clusterId,
                        topics: result.topics
                    })
                )
                setRefreshLoading(false)
                setExpandedKeys((prev) => [...prev, node.key])
            } catch (e) {
                console.log(e)
                setRefreshLoading(false)
                message.error(`Fetch topics errored: ${(e as Error).message}`)
                throw e
            }
            //  finally {
            //     setLoadingKeys((prev) => {
            //         const newSet = new Set(prev)
            //         newSet.delete(key)
            //         return newSet
            //     })
            // }
        },
        [dispath]
    )

    const onLoadData = useCallback(
        async (node: ClusterTreeNode) => {
            const key = node.key
            if (node.children && node.children.length > 0) {
                return
            }
            if (node.type === 'cluster-topic') {
                if (!node.children || node.children.length < 1) {
                    await refreshTopics(node)
                }
            } else {
                // TODO
            }
        },
        [refreshTopics]
    )

    const onExpand = (keys: React.Key[], info) => {
        // if (info.expanded) {
        //     const node = info.node as ClusterTreeNode
        //     if (node.type == 'cluster-topic') {
        //         await onLoadData(node)
        //     } else {
        //         setExpandedKeys(keys)
        //     }
        // } else {
        //     setExpandedKeys(keys)
        // }
        setExpandedKeys(keys)
    }

    useEffect(() => {
        const loadTreeData = async () => {
            const clusters = await kafkaClusterService.findAll()
            dispath(actions.kafkaCluster.initClusters(clusters))
        }
        loadTreeData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Tree
            checkable
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            showLine={true}
            showIcon={true}
            onCheck={onClusterChecked}
            onClick={onClusterClick}
            loadData={onLoadData}
            treeData={treeData}
            // loadingKeys={Array.from(loadingKeys)}
            titleRender={titleRender}
        />
    )
}

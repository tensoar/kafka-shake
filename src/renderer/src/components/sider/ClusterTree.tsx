import { Tree, TreeDataNode, TreeProps } from 'antd'
import { useEffect, useState } from 'react'
import ServiceProxy from '@renderer/util/ServiceProxy'
import { ServiceName } from '@shared/service/Constants'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@renderer/redux/store'
import { actions } from '@renderer/redux/actions'
import { ClusterTreeNode } from './types'
import { useNavigate } from 'react-router'

export type ClusterTreeProps = {
    onClusterChecked: TreeProps['onCheck']
}

export default function ClusterTree({ onClusterChecked }: ClusterTreeProps): React.JSX.Element {
    const treeData = useSelector((rootState: RootState) => rootState.kafkaCluster.clustersTree)
    const navigate = useNavigate()
    const dispath = useDispatch()
    const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(
        ServiceName.KAFKA_CLUSTER_SERVICE
    )

    const onClusterClick = (event, node: ClusterTreeNode) => {
        console.log(node)
        if (node.type === 'topic-item') {
            const key = node.key.toString()
            const spliteIndex = key.indexOf(':')
            const topic = key.substring(spliteIndex + 1)
            const clusterId = key.substring(0, spliteIndex)
            navigate(`cluster/topic/${clusterId}/${topic}`)
        }
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
            showLine={true}
            showIcon={true}
            onCheck={onClusterChecked}
            onClick={onClusterClick}
            treeData={treeData}
        />
    )
}

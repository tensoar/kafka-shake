import { Tree, TreeDataNode, TreeProps } from 'antd'
import { useEffect, useState } from 'react'
import ServiceProxy from '@renderer/util/ServiceProxy'
import { ServiceName } from '@shared/service/Constants'
import IKafkaClusterService from '@shared/service/IKafkaClusterService'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@renderer/redux/store'
import { actions } from '@renderer/redux/actions'

export default function BrokerTree(): React.JSX.Element {
    // const [treeData, setTreeData] = useState<TreeDataNode[]>([])
    const treeData = useSelector((rootState: RootState) => rootState.kafkaCluster.clustersTree)
    const dispath = useDispatch()
    const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(
        ServiceName.KAFKA_CLUSTER_SERVICE
    )

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info)
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
            defaultExpandedKeys={['0-0-0']}
            onSelect={onSelect}
            treeData={treeData}
        />
    )
}

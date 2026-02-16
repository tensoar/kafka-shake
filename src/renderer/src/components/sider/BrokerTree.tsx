import { Tree, TreeDataNode, TreeProps } from 'antd'
import { useEffect, useState } from 'react';
import ServiceProxy from '@renderer/util/ServiceProxy';
import { ServiceName } from '@shared/service/Constants';
import IKafkaClusterService from '@shared/service/IKafkaClusterService';

export default function BrokerTree(): React.JSX.Element {
    const [treeData, setTreeData] = useState<TreeDataNode[]>([])
    const kafkaClusterService = ServiceProxy.get<IKafkaClusterService>(ServiceName.KAFKA_CLUSTER_SERVICE)

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info)
    }
    useEffect(() => {
        const loadTreeData = async () => {
            const clusters = await kafkaClusterService.findAll()
            console.log(clusters)
            setTreeData(
                clusters.map((cluster) => ({
                    title: cluster.clusterName,
                    key: cluster.id!,
                    children: [
                        {
                            title: 'Cluster Info',
                            key: 'cluster_info-' + cluster.id,
                            checkable: false
                        },
                        {
                            title: 'Topics',
                            key: 'topics' + cluster.id,
                            checkable: false
                        },
                        {
                            title: 'Consumers',
                            key: 'consumers' + cluster.id,
                            checkable: false
                        }
                    ]
                }))
            )
        }

        loadTreeData()
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

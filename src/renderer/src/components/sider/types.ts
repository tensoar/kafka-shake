import { TreeDataNode } from 'antd'

export type ClusterTreeNode = TreeDataNode & {
    type: 'cluster-node' | 'cluster-info' | 'cluster-topic' | 'cluster-consumer' | 'topic-item',
    children: Array<
        {
            type:
                | 'cluster-node'
                | 'cluster-info'
                | 'cluster-topic'
                | 'cluster-consumer'
                | 'topic-item'
        } & TreeDataNode
    >
}

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ClusterTreeNode } from '@renderer/components/sider/types'
import AbsKafkaCluster from '@shared/entity/AbsKafkaCluster'

export interface ClusterTreeState {
    clustersTree: ClusterTreeNode[]
    selectedClusterId: number
    selectedTopic: string
}
export interface SetClusterTopics {
    clusterId: number
    topics: string[]
}

const initialState: ClusterTreeState = {
    clustersTree: [],
    selectedClusterId: -1,
    selectedTopic: ''
}

const clusterToTreeNode = (cluster: AbsKafkaCluster): ClusterTreeNode => {
    return {
        title: cluster.clusterName,
        key: cluster.id!,
        type: 'cluster-node',
        children: [
            {
                title: 'Cluster Info',
                key: 'cluster_info-' + cluster.id,
                checkable: false,
                isLeaf: true,
                type: 'cluster-info'
            },
            {
                title: 'Topics',
                key: 'topics-' + cluster.id,
                checkable: false,
                type: 'cluster-topic',
                isLeaf: false,
                children: []
            }
            // {
            //     title: 'Consumers',
            //     key: 'consumers-' + cluster.id,
            //     checkable: false,
            //     type: 'cluster-consumer'
            // }
        ]
    }
}

const kafkaClusterSlice = createSlice({
    name: 'kafka-cluster',
    initialState: initialState,
    reducers: {
        initClusters: (state, action: PayloadAction<AbsKafkaCluster[]>) => {
            state.clustersTree = action.payload.map((cluster) => clusterToTreeNode(cluster))
        },
        addCluster: (state, action: PayloadAction<AbsKafkaCluster>) => {
            state.clustersTree = [...state.clustersTree, clusterToTreeNode(action.payload)]
        },
        updateCluster: (state, action: PayloadAction<AbsKafkaCluster>) => {
            const clusters = [...state.clustersTree]
            const index = clusters.findIndex((cluster) => cluster.key === action.payload.id)
            if (index > -1) {
                clusters[index] = clusterToTreeNode(action.payload)
            }
        },
        removeCluster: (state, action: PayloadAction<number | number[]>) => {
            if (typeof action.payload === 'number') {
                state.clustersTree = state.clustersTree.filter(
                    (cluster) => cluster.key != action.payload
                )
            } else {
                state.clustersTree = state.clustersTree.filter(
                    (cluster) => !(action.payload as number[]).includes(cluster.key as number)
                )
            }
        },
        setSelectedClusterId: (state, action: PayloadAction<number>) => {
            state.selectedClusterId = action.payload
        },
        setSelectedTopic: (state, action: PayloadAction<string>) => {
            state.selectedTopic = action.payload
        },
        setClusterTopics: (state, action: PayloadAction<SetClusterTopics>) => {
            const { clusterId, topics } = action.payload
            const clusterNode = state.clustersTree.find((it) => it.key === clusterId)
            if (!clusterNode) {
                console.log(`No cluster node was found with id: `, clusterId)
                return
            }
            const topicsNode = clusterNode?.children.find(
                (it) => it.key == `topics-` + clusterId
            ) as ClusterTreeNode
            if (!topicsNode) {
                console.log(`No topics node was found with key: `, `topics-` + clusterId)
                return
            }
            topicsNode.children = topics.map((t) => ({
                title: t,
                isLeaf: true,
                key: clusterId + ':' + t,
                checkable: false,
                type: 'topic-item'
            }))
            state.clustersTree = [...state.clustersTree]
        }
    }
})

export const {
    initClusters,
    addCluster,
    updateCluster,
    removeCluster,
    setSelectedClusterId,
    setSelectedTopic,
    setClusterTopics
} = kafkaClusterSlice.actions

export const kafkaClusterReducer = kafkaClusterSlice.reducer

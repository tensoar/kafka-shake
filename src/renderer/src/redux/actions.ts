import {
    addCluster,
    initClusters,
    removeCluster,
    setSelectedClusterId,
    setSelectedTopic,
    updateCluster
} from './slice/KafkaClusterSlice'
import { addMessage, clearMessage } from './slice/KafkaMessageSlice'
import { setThemeStyle } from './slice/ThemeSlice'

export const actions = {
    theme: {
        setThemeStyle
    },
    kafkaCluster: {
        initClusters,
        addCluster,
        updateCluster,
        removeCluster,
        setSelectedClusterId,
        setSelectedTopic
    },
    kafkaMessage: {
        addMessage,
        clearMessage
    }
}

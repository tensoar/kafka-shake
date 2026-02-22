import TopicMain from '@renderer/components/topic/TopicMain'
import Main from '../components/Main'
import { createHashRouter } from 'react-router'
import ClusterMain from '@renderer/components/cluster/ClusterMain'

const router = createHashRouter([
    {
        path: '/',
        element: <Main />,
        children: [
            {
                path: 'cluster/topic/:clusterId/:topicName',
                element: <TopicMain />
            },
            {
                path: 'cluster/info/:clusterId',
                element: <ClusterMain />
            },
            {
                index: true,
                element: <div>Kafka Shake</div>
            }
        ]
    }
])

export default router

import TopicMain from '@renderer/components/topic/TopicMain'
import Main from '../components/Main'
import { createHashRouter } from 'react-router'

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
                index: true,
                element: <div>Kafka Shake</div>
            }
        ]
    }
])

export default router

import useTopicMessages from '@renderer/hooks/useTopicMessages'
import { actions } from '@renderer/redux/actions';
import kafkaUtil from '@renderer/util/KafkaUtil';
import { KafkaWokerMessageFetchMessage, KafkaWokerPayloadFetchMessage } from '@shared/types';
import { Button } from 'antd'
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router'

export default function TopicMain() {
    const { clusterId, topicName } = useParams<{ clusterId: string; topicName: string }>()
    const messages = useTopicMessages(parseInt(clusterId as string), topicName as string)
    const dispath = useDispatch()

    return (
        <div>
            <Button
                onClick={async () => {
                    const payload: KafkaWokerPayloadFetchMessage = {
                        clusterId: parseInt(clusterId as string),
                        topic: topicName as string,
                        count: 10,
                        direction: 'latest',
                        action: 'fetch-message'
                    }
                    const data = await window.api.callKafkaAction(payload)
                    console.log('fetch data: ', data)
                    dispath(
                        actions.kafkaMessage.addMessage({
                            topicId: kafkaUtil.buildTopicId(clusterId as string, topicName as string),
                            message: (data as KafkaWokerMessageFetchMessage).messages
                        })
                    )
                }}
            >fetch</Button>
            {messages.map((m) => {
                return <p key={m.offset}>{m.value}</p>
            })}
        </div>
    )
}

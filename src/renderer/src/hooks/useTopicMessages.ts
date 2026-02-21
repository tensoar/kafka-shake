import kafkaUtil from '@renderer/util/KafkaUtil'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { useEffect } from 'react'
import { IKafkaMessage, IKafkaMessageDiaptchType } from '@shared/types'
import { actions } from '@renderer/redux/actions'

const EMPTY_MESSAGE: IKafkaMessage[] = []

export default function useTopicMessages(clusterId: number, topicName: string) {
    const dispatch = useDispatch()
    const topicId = kafkaUtil.buildTopicId(clusterId, topicName)
    const messages = useSelector((state: RootState) => state.kafkaMessage[topicId] || EMPTY_MESSAGE)

    useEffect(() => {
        const handler = (event, data: IKafkaMessageDiaptchType) => {
            dispatch(actions.kafkaMessage.addMessage(data))
            console.log(data)
        }

        // todo lisentening exposed api

        return () => {
            // todo remove lisentener
        }
    }, [dispatch, topicId])

    return messages
}

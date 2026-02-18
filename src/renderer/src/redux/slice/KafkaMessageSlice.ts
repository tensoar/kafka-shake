import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IKafkaMessage, IKafkaMessageDiaptchType } from '@shared/types';
import _ from 'lodash'

export interface KafkaMessageState {
    [topicId: string]: IKafkaMessage[]
}

const maxMessageCacheSize = 20000;

const initialState: KafkaMessageState = {}

const kafkaMessageSlice = createSlice({
    name: 'kafka-message',
    initialState: initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<IKafkaMessageDiaptchType>) => {
            const { topicId, message } = action.payload
            const exitsMessages = state[topicId] || []
            let newMessages: IKafkaMessage[]
            if (_.isArray(message)) {
                newMessages = [...message, ...exitsMessages]
            } else {
                newMessages = [message, ...exitsMessages]
            }
            if (newMessages.length > maxMessageCacheSize) {
                newMessages = newMessages.slice(maxMessageCacheSize)
            }
            state[topicId] = newMessages
        },

        initMessage: (state, action: PayloadAction<IKafkaMessageDiaptchType>) => {
            const { topicId, message } = action.payload
            if (_.isArray(message)) {
                state[topicId] = action.payload.message as IKafkaMessage[]
            } else {
                state[topicId] = [action.payload.message as IKafkaMessage]
            }
        },

        clearMessage: (state, action: PayloadAction<string>) => {
            state[action.payload] = []
        }
    }
})

export const { initMessage, addMessage, clearMessage } = kafkaMessageSlice.actions
export const kafkaMessageReducer = kafkaMessageSlice.reducer

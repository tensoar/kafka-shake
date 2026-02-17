import { configureStore } from '@reduxjs/toolkit'
import { themeReducer } from './slice/ThemeSlice'
import { kafkaClusterReducer } from './slice/KafkaClusterSlice'
import { kafkaMessageReducer } from './slice/KafkaMessageSlice'

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        kafkaCluster: kafkaClusterReducer,
        kafkaMessage: kafkaMessageReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

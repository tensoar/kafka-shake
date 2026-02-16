import { configureStore } from '@reduxjs/toolkit'
import { themeReducer } from './slice/ThemeSlice'
import { kafkaClusterReducer } from './slice/KafkaClusterSlice'

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        kafkaCluster: kafkaClusterReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

import { ElectronAPI } from '@electron-toolkit/preload'
import { KafkaActionResult, KafkaActionPayload } from '@shared/types'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            callService: (serviceName: string, method: string, ...args: unknown[]) => unknown,
            callKafkaAction: (payload: KafkaActionPayload) => Promise<KafkaActionResult>
        }
    }
}

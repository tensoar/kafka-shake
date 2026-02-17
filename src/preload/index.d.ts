import { ElectronAPI } from '@electron-toolkit/preload'
import { KafkaWokerMessage, KafkaWorkerPayload } from '@shared/types'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            callService: (serviceName: string, method: string, ...args: unknown[]) => unknown,
            callKafkaAction: (payload: KafkaWorkerPayload) => Promise<KafkaWokerMessage>
        }
    }
}

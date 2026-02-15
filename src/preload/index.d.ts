import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            callService: (serviceName: string, method: string, ...args: unknown[]) => unknown
        }
    }
}

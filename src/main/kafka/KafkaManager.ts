import KafkaClusterService from '@main/db/service/KafkaClusterService'
import SASLConfService from '@main/db/service/SASLService'
import { KafkaWokerMessage, KafkaWorkerPayload } from '@shared/types'
import { BrowserWindow } from 'electron'
import path from 'path'
import { Worker } from 'worker_threads'

export default class KafkaManager {
    private readonly workers = new Map<number, Worker>()
    private readonly messageHandlers = new Map<string, (data: KafkaWokerMessage) => void>()
    private readonly kafkaClusterService = KafkaClusterService.instance()
    private readonly saslConfService = SASLConfService.instance()

    async getWorker(clusterId: number) {
        if (this.workers.get(clusterId)) {
            return this.workers.get(clusterId)
        }
        const cluster = await this.kafkaClusterService.findOneById(clusterId)
        if (!cluster) {
            console.log(`No cluster with id: ${clusterId}`)
            return
        }
        console.log('cluster: ', cluster)
        const saslConf = await this.saslConfService.findFirstBy({ clusterId })
        console.log('saslConf: ', saslConf)
        const workerPath = path.join(__dirname, 'KafkaWorker.js')

        const worker = new Worker(workerPath, {
            workerData: { cluster, saslConf }
        })

        worker.on('message', (message) => {
            console.log(message)
        })

        worker.on('error', (error) => {
            console.log(error)
        })

        worker.on('exit', (code) => {
            console.log(`Worker ${clusterId} exited with code ${code}`)
            this.workers.delete(clusterId)
        })

        this.workers.set(clusterId, worker)
        return worker
    }

    private async sendRequest(payload: KafkaWorkerPayload): Promise<KafkaWokerMessage> {
        const clusterId = payload.clusterId
        const worker = await this.getWorker(clusterId)
        const messageId = `${clusterId}-${Date.now()}-${Math.random()}`
        return new Promise((resolve, reject) => {
            this.messageHandlers.set(messageId, (response) => {
                resolve(response)
            })

            worker!.postMessage(payload)
            // 可设置超时
            setTimeout(() => {
                if (this.messageHandlers.has(messageId)) {
                    this.messageHandlers.delete(messageId)
                    reject(new Error('Request timeout'))
                }
            }, 30000)
        })
    }

    handleWokerMessage(message: KafkaWokerMessage) {
        BrowserWindow.getAllWindows().forEach((win) => {
            win.webContents.send(message.action, message)
        })
    }

    async postWorkPayload(payload: KafkaWorkerPayload) {
        if (!this.getWorker(payload.clusterId)) {
            return
        }
        return this.sendRequest(payload)
    }
}

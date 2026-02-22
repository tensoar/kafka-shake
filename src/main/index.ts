import 'reflect-metadata'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import DataSourceManager from './db/DataSourceManager'
import KafkaClusterService from './db/service/KafkaClusterService'
import ServiceRegistry from './db/ServiceRegistry'
import { ServiceName } from '@shared/service/Constants'
import SASLConfService from './db/service/SASLService'
import { KafkaActionPayload } from '@shared/types'
import KafkaManager from './kafka/KafkaManager'

function createWindow(): void {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 750,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('ink.labrador.kafka-shake')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))
    ipcMain.handle('call-service', async (__, { serviceName, method, args }) => {
        const service = ServiceRegistry.getService(serviceName)
        if (typeof service[method] !== 'function') {
            throw new Error(`Method ${method} not found on service ${serviceName}`);
        }
        // eslint-disable-next-line prefer-spread
        return await service[method].apply(service, args)
    })

    if (!(await DataSourceManager.initialize())) {
        console.log('Initialize DB failed ...')
    } else {
        console.log('DB initlized ...')
    }

    ServiceRegistry.register(ServiceName.KAFKA_CLUSTER_SERVICE, KafkaClusterService.instance())
    ServiceRegistry.register(ServiceName.SASL_CONF_SERVICE, SASLConfService.instance())

    const kafkaManager = new KafkaManager()

    ipcMain.handle('kafka-action', async (__, payload: KafkaActionPayload) => {
        console.log('kafka-action payload: ', payload)
        if (payload.action === 'fetch-message') {
            return kafkaManager.fetchMessage(payload)
        } else if (payload.action === 'fetch-topics') {
            return kafkaManager.fetchTopics(payload)
        }
        return
    })

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

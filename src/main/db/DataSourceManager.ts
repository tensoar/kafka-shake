import 'reflect-metadata'
import path from 'path'
import os from 'os'
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm'
import KafkaCluster from '@main/entity/KafkaCluster'

const cwdDir = path.join(
    process.env.HOME || process.env.USERPROFILE || os.homedir(),
    '.kafka-shake'
)

export default class DataSourceManager {
    private static readonly ds = new DataSource({
        type: 'better-sqlite3',
        database: path.join(cwdDir, 'ks.db'),
        entities: [KafkaCluster],
        synchronize: false,
        logging: true
    })

    static async initialize(): Promise<boolean> {
        try {
            await this.ds.initialize()
            await this.ds.query(`
                CREATE TABLE IF NOT EXISTS kafka_cluster (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cluster_name TEXT NOT NULL DEFAULT '',
                    brokers TEXT NOT NULL DEFAULT '',
                    client_id TEXT NOT NULL DEFAULT '',
                    sasl TEXT NOT NULL DEFAULT 'none',
                    use_ssl INTEGER NOT NULL DEFAULT 0
                );
            `)
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    static getRep<T extends ObjectLiteral>(target: EntityTarget<T>) {
        return this.ds.getRepository(target)
    }
}


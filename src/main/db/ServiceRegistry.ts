import { ObjectLiteral } from 'typeorm'
import BaseService from './service/BaseService'
import Identifiable from '@shared/entity/Identifiable'

export default class ServiceRegistry {
    private static readonly services = new Map<
        string,
        BaseService<Identifiable, Identifiable & ObjectLiteral>
    >()

    static register<T extends BaseService<Identifiable, Identifiable & ObjectLiteral>>(
        name: string,
        instance: T
    ) {
        this.services.set(name, instance)
    }

    static getService<T extends BaseService<Identifiable, Identifiable & ObjectLiteral>>(
        name: string
    ) {
        return this.services.get(name) as T
    }
}

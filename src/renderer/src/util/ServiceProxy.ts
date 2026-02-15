import IBaseService from '@shared/service/IBaseService'
import Identifiable from '@shared/entity/Identifiable'

export default class ServiceProxy {
    static get<T extends IBaseService<Identifiable, Identifiable>>(serviceName: string): T {
        return new Proxy({} as T, {
            get:
                (__, prop: string) =>
                (...args: unknown[]) => {
                    return window.api.callService(serviceName, prop, ...args)
                }
        }) as T
    }
}

export default abstract class AbsSASALConf {
    id?: number
    abstract clusterId: number
    abstract username: string
    abstract password: string
    abstract token: string

    static createDefault(): AbsSASALConf {
        return {
            clusterId: 0,
            username: '',
            password: '',
            token: ''
        }
    }
}

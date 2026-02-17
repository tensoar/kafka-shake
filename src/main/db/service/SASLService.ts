import AbsSASALConf from '@shared/entity/AbsSASALConf'
import BaseService from './BaseService'
import SASALConf from '@main/entity/SASALConf'
import ISASLConfService from '@shared/service/ISASLConfService'

export default class SASLConfService
    extends BaseService<AbsSASALConf, SASALConf>
    implements ISASLConfService
{
    private static _instance: SASLConfService | null = null
    constructor() {
        super(SASALConf)
    }

    static instance(): SASLConfService {
        if (SASLConfService._instance == null) {
            SASLConfService._instance = new SASLConfService()
        }
        return SASLConfService._instance
    }
}

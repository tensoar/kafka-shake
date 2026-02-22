import { ObjectLiteral, FindOptionsWhere } from 'typeorm'
import Identifiable from '@shared/entity/Identifiable'

export default interface IBaseService<
    TAbstract extends Identifiable,
    TEntity extends ObjectLiteral & TAbstract
> {
    saveOne(data: TAbstract): Promise<TAbstract>

    saveMany(dataArray: TAbstract[]): Promise<TAbstract[]>

    findOneById(id: number): Promise<TAbstract | null>

    findFirstBy(where: FindOptionsWhere<TEntity>): Promise<TAbstract>

    findAll(): Promise<TAbstract[]>

    findManyBy(where: FindOptionsWhere<TEntity>): Promise<TAbstract[]>

    update(id: number, data: Partial<TAbstract>): Promise<TAbstract | null>

    deleteById(id: number | number[]): Promise<boolean>
}

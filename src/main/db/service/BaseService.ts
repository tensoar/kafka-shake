import { EntityTarget, ObjectLiteral, Repository, DeepPartial, FindOptionsWhere } from 'typeorm'
import DataSourceManager from '../DataSourceManager'
import Identifiable from '@shared/entity/Identifiable'
import IBaseService from '@shared/service/IBaseService'

export default abstract class BaseService<
    TAbstract extends Identifiable,
    TEntity extends ObjectLiteral & TAbstract
> implements IBaseService<TAbstract, TEntity> {
    private readonly rep: Repository<TEntity>
    constructor(entityTaget: EntityTarget<TEntity>) {
        this.rep = DataSourceManager.getRep(entityTaget)
    }

    protected getRep() {
        return this.rep
    }

    async saveOne(data: TAbstract): Promise<TAbstract> {
        const entity = this.rep.create(data as DeepPartial<TEntity>)
        const saved = await this.rep.save(entity)
        return saved as unknown as TAbstract
    }

    async saveMany(dataArray: TAbstract[]): Promise<TAbstract[]> {
        const entities = this.rep.create(dataArray as DeepPartial<TEntity>[])
        const saved = await this.rep.save(entities)
        return saved as unknown as TAbstract[]
    }

    async findOneById(id: number): Promise<TAbstract | null> {
        const entity = await this.rep.findOneBy({ id } as FindOptionsWhere<TEntity>)
        return entity as TAbstract | null
    }

    async findAll(): Promise<TAbstract[]> {
        const entities = await this.rep.find()
        return entities as unknown as TAbstract[]
    }

    async findManyBy(where: FindOptionsWhere<TEntity>): Promise<TAbstract[]> {
        const entities = await this.rep.findBy(where)
        return entities as unknown as TAbstract[]
    }

    async update(id: number, data: Partial<TAbstract>): Promise<TAbstract | null> {
        const existing = await this.rep.findOneBy({ id } as FindOptionsWhere<TEntity>)
        if (!existing) return null

        const updatedEntity = this.rep.merge(existing, data as DeepPartial<TEntity>)
        const saved = await this.rep.save(updatedEntity)
        return saved as unknown as TAbstract
    }

    async deleteById(id: number | number[]): Promise<boolean> {
        const result = await this.rep.delete(id)
        return (result.affected ?? 0) > 0
    }
}

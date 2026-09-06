import { Types } from 'mongoose';
import { AdoptionPetRepository } from '../repository/adoption-pet.repository';
import { AdoptionApplicationRepository } from '../../adoption-application/repository/adoption-application.repository';

describe('소유자 없는 분양글 공개 차단 (운영 DB 접근 없음)', () => {
    const ownerId = new Types.ObjectId();
    const petId = new Types.ObjectId().toString();
    function setup() {
        const chain: any = { exec: jest.fn().mockResolvedValue([]) };
        for (const name of ['sort', 'skip', 'limit']) chain[name] = jest.fn().mockReturnValue(chain);
        const model: any = {};
        for (const name of ['find', 'findOne', 'countDocuments', 'findOneAndUpdate']) {
            model[name] = jest.fn().mockReturnValue(chain);
        }
        const breeders: any = { distinct: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([ownerId]) }) };
        return { repository: new AdoptionPetRepository(model, breeders), model, breeders, chain };
    }

    it('목록·개수·인기는 페이지네이션 전에 실존 소유자로 제한함', async () => {
        const { repository, model, breeders } = setup();
        await repository.findList({ sort: 'latest', skip: 0, limit: 10 });
        await repository.countList({});
        await repository.findPopular(undefined, 3);
        expect(breeders.distinct).toHaveBeenCalledWith('_id', {});
        for (const call of [...model.find.mock.calls, ...model.countDocuments.mock.calls]) {
            expect(call[0].breederId).toEqual({ $in: [ownerId] });
        }
    });

    it('브리더 ID 필터도 실존 소유자 조회를 거쳐 적용함', async () => {
        const { repository, model, breeders } = setup();
        await repository.findList({ breederId: ownerId.toString(), sort: 'latest', skip: 0, limit: 10 });
        expect(breeders.distinct).toHaveBeenCalledWith('_id', { _id: ownerId.toString() });
        expect(model.find.mock.calls[0][0].breederId).toEqual({ $in: [ownerId] });
    });

    it('직접 상세 조회와 조회수 갱신에도 동일한 공개 조건을 적용함', async () => {
        const { repository, model } = setup();
        await repository.findActiveById(petId);
        await repository.incrementViewCount(petId);
        expect(model.findOne.mock.calls[0][0].breederId).toEqual({ $in: [ownerId] });
        expect(model.findOneAndUpdate.mock.calls[0][0].breederId).toEqual({ $in: [ownerId] });
    });

    it.each([null, { _id: ownerId }])('소유자 존재를 확인한 뒤에만 신청 대상을 반환함: %p', async (owner) => {
        const pet = { _id: petId, breederId: ownerId };
        const petModel: any = { findOne: () => ({ lean: () => ({ exec: async () => pet }) }) };
        const breederModel: any = { exists: jest.fn().mockResolvedValue(owner) };
        const repository = new AdoptionApplicationRepository({} as any, petModel, {} as any, breederModel);
        expect(await repository.findApplicablePet(petId)).toEqual(owner ? pet : null);
        expect(breederModel.exists).toHaveBeenCalledWith({ _id: ownerId });
    });
});

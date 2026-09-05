import { Types } from 'mongoose';
import { AdoptionPetRepository } from '../repository/adoption-pet.repository';
import { AdoptionApplicationRepository } from '../../adoption-application/repository/adoption-application.repository';
import { GetBreederProfileUseCase } from '../../profile/application/use-cases/get-breeder-profile.use-case';

describe('테스트 계정 공개 차단 (운영 DB 접근 없음)', () => {
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

    it('목록·개수·인기는 페이지네이션 전에 테스트가 아닌 실존 소유자로 제한함', async () => {
        const { repository, model, breeders } = setup();
        await repository.findList({ sort: 'latest', skip: 0, limit: 10 });
        await repository.countList({});
        await repository.findPopular(undefined, 3);
        expect(breeders.distinct).toHaveBeenCalledWith('_id', { isTestAccount: { $ne: true } });
        for (const call of [...model.find.mock.calls, ...model.countDocuments.mock.calls]) {
            expect(call[0].breederId).toEqual({ $in: [ownerId] });
        }
    });

    it('브리더 ID 필터로 테스트 계정 차단 조건을 덮어쓸 수 없음', async () => {
        const { repository, model, breeders } = setup();
        await repository.findList({ breederId: ownerId.toString(), sort: 'latest', skip: 0, limit: 10 });
        expect(breeders.distinct).toHaveBeenCalledWith('_id', {
            _id: ownerId.toString(),
            isTestAccount: { $ne: true },
        });
        expect(model.find.mock.calls[0][0].breederId).toEqual({ $in: [ownerId] });
    });

    it('직접 상세 조회와 조회수 갱신에도 동일한 공개 조건을 적용함', async () => {
        const { repository, model } = setup();
        await repository.findActiveById(petId);
        await repository.incrementViewCount(petId);
        expect(model.findOne.mock.calls[0][0].breederId).toEqual({ $in: [ownerId] });
        expect(model.findOneAndUpdate.mock.calls[0][0].breederId).toEqual({ $in: [ownerId] });
    });

    it.each([null, { _id: ownerId }])('소유자 공개 검증 후에만 신청 대상을 반환함: %p', async (owner) => {
        const pet = { _id: petId, breederId: ownerId };
        const petModel: any = { findOne: () => ({ lean: () => ({ exec: async () => pet }) }) };
        const breederModel: any = { exists: jest.fn().mockResolvedValue(owner) };
        const repository = new AdoptionApplicationRepository({} as any, petModel, {} as any, breederModel);
        expect(await repository.findApplicablePet(petId)).toEqual(owner ? pet : null);
        expect(breederModel.exists).toHaveBeenCalledWith({ _id: ownerId, isTestAccount: { $ne: true } });
    });

    it('테스트 브리더 공개 프로필은 DTO 생성 이전에 거부함', async () => {
        const reader: any = { readBreeder: jest.fn().mockResolvedValue({ isTestAccount: true }) };
        const mapper: any = { toBreederPublicDto: jest.fn() };
        const useCase = new GetBreederProfileUseCase(reader, {} as any, mapper);
        await expect(useCase.execute(ownerId.toString())).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
        expect(mapper.toBreederPublicDto).not.toHaveBeenCalled();
    });
});

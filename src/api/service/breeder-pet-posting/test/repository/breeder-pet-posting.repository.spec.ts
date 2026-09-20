import { Types } from 'mongoose';

import { BreederPetPostingRepository } from '../../repository/breeder-pet-posting.repository';

describe('분양글 리포지토리 — 부분 수정 갱신 연산 조립', () => {
    const petId = new Types.ObjectId().toString();
    const breederId = new Types.ObjectId().toString();

    function setup(matchedCount = 1) {
        const model: any = {
            updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ matchedCount }) }),
            exists: jest.fn().mockResolvedValue({ _id: petId }),
        };
        return { repository: new BreederPetPostingRepository(model), model };
    }

    /** 마지막 updateOne 호출의 [filter, update] */
    const lastUpdate = (model: any) => model.updateOne.mock.calls.at(-1);

    it('일반 값은 $set 으로 보낸다', async () => {
        const { repository, model } = setup();

        await repository.updateByOwner(petId, breederId, { price: 100, status: 'reserved' });

        const [, update] = lastUpdate(model);
        expect(update).toEqual({ $set: { price: 100, status: 'reserved' } });
    });

    it('null 은 $set 이 아니라 $unset 으로 보낸다 — 모순된 값이 필드에 남으면 안 된다', async () => {
        const { repository, model } = setup();

        await repository.updateByOwner(petId, breederId, {
            vaccinationStatus: 'completed',
            vaccinationRecords: [{ name: '종합백신', date: new Date('2024-12-01'), round: 1 }],
            vaccinationIncompleteReason: null,
        });

        const [, update] = lastUpdate(model);
        expect(update.$set.vaccinationStatus).toBe('completed');
        expect(update.$set).not.toHaveProperty('vaccinationIncompleteReason');
        expect(update.$unset).toEqual({ vaccinationIncompleteReason: '' });
    });

    it('undefined 필드는 어느 연산에도 싣지 않는다 — 기존 DB 값이 유지된다', async () => {
        const { repository, model } = setup();

        await repository.updateByOwner(petId, breederId, { price: 100, description: undefined });

        const [, update] = lastUpdate(model);
        expect(update.$set).toEqual({ price: 100 });
        expect(update).not.toHaveProperty('$unset');
    });

    it('제거만 있는 patch 도 갱신을 수행한다', async () => {
        const { repository, model } = setup();

        const result = await repository.updateByOwner(petId, breederId, { breedingEnvironment: null });

        expect(model.exists).not.toHaveBeenCalled();
        expect(lastUpdate(model)[1]).toEqual({ $unset: { breedingEnvironment: '' } });
        expect(result).toEqual({ changed: true });
    });

    it('빈 patch 는 갱신 없이 소유 여부만 확인한다', async () => {
        const { repository, model } = setup();

        const result = await repository.updateByOwner(petId, breederId, {});

        expect(model.updateOne).not.toHaveBeenCalled();
        expect(model.exists).toHaveBeenCalled();
        expect(result).toEqual({ changed: true });
    });

    it('본인 글 + 활성 상태만 갱신 대상이다', async () => {
        const { repository, model } = setup();

        await repository.updateByOwner(petId, breederId, { price: 100 });

        const [filter] = lastUpdate(model);
        expect(filter._id).toEqual(new Types.ObjectId(petId));
        expect(filter.breederId).toEqual(new Types.ObjectId(breederId));
        expect(filter.isActive).toBe(true);
    });

    it('매칭이 없으면 changed=false', async () => {
        const { repository } = setup(0);

        await expect(repository.updateByOwner(petId, breederId, { price: 100 })).resolves.toEqual({ changed: false });
    });

    it('ObjectId 형식이 아니면 쿼리를 던지지 않는다', async () => {
        const { repository, model } = setup();

        await expect(repository.updateByOwner('not-an-id', breederId, { price: 100 })).resolves.toEqual({
            changed: false,
        });
        expect(model.updateOne).not.toHaveBeenCalled();
    });
});

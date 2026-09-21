import { Types } from 'mongoose';

import { AdoptionPetRepository } from '../repository/adoption-pet.repository';

describe('분양완료 펫 노출 규칙 (목록에서 내려가되 상세는 열린다)', () => {
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
        return { repository: new AdoptionPetRepository(model, breeders), model };
    }

    it('status 를 명시하지 않은 목록·개수는 adopted 를 제외한다', async () => {
        const { repository, model } = setup();

        await repository.findList({ sort: 'latest', skip: 0, limit: 10 });
        await repository.countList({});

        expect(model.find.mock.calls[0][0].status).toEqual({ $ne: 'adopted' });
        expect(model.countDocuments.mock.calls[0][0].status).toEqual({ $ne: 'adopted' });
    });

    it('status=adopted 를 명시적으로 요청하면 그대로 조회된다 (브리더 관리·입양완료 목록 경로)', async () => {
        const { repository, model } = setup();

        await repository.findList({ status: 'adopted', sort: 'latest', skip: 0, limit: 10 });
        await repository.countList({ status: 'adopted' });

        expect(model.find.mock.calls[0][0].status).toBe('adopted');
        expect(model.countDocuments.mock.calls[0][0].status).toBe('adopted');
    });

    it('다른 status 필터(available/reserved)도 그대로 유지된다', async () => {
        const { repository, model } = setup();

        await repository.findList({ status: 'available', sort: 'latest', skip: 0, limit: 10 });

        expect(model.find.mock.calls[0][0].status).toBe('available');
    });

    it('상세 조회와 조회수 갱신은 adopted 를 제외하지 않는다 (공유 링크 404 방지)', async () => {
        const { repository, model } = setup();

        await repository.findActiveById(petId);
        await repository.incrementViewCount(petId);

        expect(model.findOne.mock.calls[0][0]).not.toHaveProperty('status');
        expect(model.findOneAndUpdate.mock.calls[0][0]).not.toHaveProperty('status');
    });

    it('인기 목록은 분양가능만 노출한다', async () => {
        const { repository, model } = setup();

        await repository.findPopular(undefined, 3);

        expect(model.find.mock.calls[0][0].status).toBe('available');
    });
});

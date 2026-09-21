import { Types } from 'mongoose';

import { ApplicationStatus, REAPPLICATION_BLOCKING_STATUSES } from '../../../../common/enum/user.enum';
import { AdoptionRecordRepository } from '../repository/adoption-record.repository';
import { AdoptionApplicationRepository } from '../../adoption-application/repository/adoption-application.repository';

describe('내 신청 상태 판정 기준', () => {
    const adopterId = new Types.ObjectId().toString();
    const petId = new Types.ObjectId().toString();

    function setupRecordRepository(found: unknown = null) {
        const chain: any = { exec: jest.fn().mockResolvedValue(found) };
        for (const name of ['select', 'sort', 'lean']) chain[name] = jest.fn().mockReturnValue(chain);
        const model: any = { findOne: jest.fn().mockReturnValue(chain) };
        return { repository: new AdoptionRecordRepository(model), model };
    }

    it('재신청 차단(existsOpenApplicationForPet)과 상세 조회가 같은 상태 목록을 본다', async () => {
        const { repository, model } = setupRecordRepository();
        const exists = jest.fn().mockResolvedValue(null);
        const applicationRepository = new AdoptionApplicationRepository(
            { exists } as any,
            {} as any,
            {} as any,
            {} as any,
        );

        await repository.findBlockingApplicationForPet(adopterId, petId);
        await applicationRepository.existsOpenApplicationForPet(adopterId, petId);

        const detailStatuses = model.findOne.mock.calls[0][0].status.$in;
        const blockStatuses = exists.mock.calls[0][0].status.$in;

        // 이게 갈라지면 "버튼은 활성인데 제출하면 409" 로 되돌아간다.
        expect(detailStatuses).toEqual(blockStatuses);
        expect(detailStatuses).toEqual([...REAPPLICATION_BLOCKING_STATUSES]);
    });

    it('거절된 신청은 대상이 아니다 (재신청을 막지 않으므로)', async () => {
        const { repository, model } = setupRecordRepository();

        await repository.findBlockingApplicationForPet(adopterId, petId);

        expect(model.findOne.mock.calls[0][0].status.$in).not.toContain(ApplicationStatus.ADOPTION_REJECTED);
    });

    it('확정된 신청도 대상이다', async () => {
        const { repository, model } = setupRecordRepository();

        await repository.findBlockingApplicationForPet(adopterId, petId);

        expect(model.findOne.mock.calls[0][0].status.$in).toContain(ApplicationStatus.ADOPTION_APPROVED);
    });

    it('여러 건이면 가장 최근 신청을 고른다', async () => {
        const { repository, model } = setupRecordRepository();

        await repository.findBlockingApplicationForPet(adopterId, petId);

        const chain = model.findOne.mock.results[0].value;
        expect(chain.sort).toHaveBeenCalledWith({ appliedAt: -1 });
    });

    it('잘못된 id 는 DB 를 치지 않고 null 을 준다', async () => {
        const { repository, model } = setupRecordRepository();

        await expect(repository.findBlockingApplicationForPet('not-an-id', petId)).resolves.toBeNull();
        await expect(repository.findBlockingApplicationForPet(adopterId, 'not-an-id')).resolves.toBeNull();
        expect(model.findOne).not.toHaveBeenCalled();
    });
});

import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { AdoptionApplicationRepository } from '../../repository/adoption-application.repository';

describe('브리더 관리 신청 리포지토리 — 확정 후속 쓰기', () => {
    /**
     * @param candidates 일괄 거절 대상으로 조회될 신청들
     * @param transitionResults findOneAndUpdate 결과 — null 이면 조회 후 상태가 바뀌어 전이에 실패한 경우
     */
    function setup(
        candidates: Array<{ _id: { toString(): string }; adopterId: { toString(): string } }> = [],
        transitionResults: Array<unknown> = candidates.map(() => ({})),
    ) {
        const findOneAndUpdate = jest.fn();
        for (const result of transitionResults) {
            findOneAndUpdate.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(result) });
        }

        const model: any = {
            updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
            find: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(candidates) }),
                }),
            }),
            findOneAndUpdate,
        };
        return { repository: new AdoptionApplicationRepository(model), model };
    }

    const candidate = (id: string, adopterId: string) => ({
        _id: { toString: () => id },
        adopterId: { toString: () => adopterId },
    });

    it('확정 시각을 approvedAt 에 기록한다', async () => {
        const { repository, model } = setup();
        const approvedAt = new Date('2026-09-06T12:00:00.000Z');

        await repository.recordApprovedAt('app-1', approvedAt);

        expect(model.updateOne).toHaveBeenCalledWith({ _id: 'app-1' }, { $set: { approvedAt } });
    });

    it('같은 펫의 처리 중 신청만, 확정 본인 신청은 제외하고 조회한다', async () => {
        const { repository, model } = setup([candidate('app-2', 'adopter-2')]);

        await repository.rejectOtherOpenApplicationsForPet('pet-1', 'app-1');

        const [filter] = model.find.mock.calls[0];
        expect(filter.petId).toBe('pet-1');
        expect(filter._id).toEqual({ $ne: 'app-1' });
        expect(filter.status).toEqual({
            $in: [ApplicationStatus.CONSULTATION_PENDING, ApplicationStatus.CONSULTATION_COMPLETED],
        });
    });

    it('이미 확정·거절된 신청은 일괄 거절 대상에서 빠진다', async () => {
        const { repository, model } = setup();

        await repository.rejectOtherOpenApplicationsForPet('pet-1', 'app-1');

        const [filter] = model.find.mock.calls[0];
        expect(filter.status.$in).not.toContain(ApplicationStatus.ADOPTION_APPROVED);
        expect(filter.status.$in).not.toContain(ApplicationStatus.ADOPTION_REJECTED);
    });

    it('거절 처리한 신청의 ID 와 입양자 ID 를 돌려준다 (거절 알림 발송 대상)', async () => {
        const { repository, model } = setup([candidate('app-2', 'adopter-2'), candidate('app-3', 'adopter-3')]);

        await expect(repository.rejectOtherOpenApplicationsForPet('pet-1', 'app-1')).resolves.toEqual([
            { applicationId: 'app-2', adopterId: 'adopter-2' },
            { applicationId: 'app-3', adopterId: 'adopter-3' },
        ]);

        const [filter, update] = model.findOneAndUpdate.mock.calls[0];
        expect(filter.status).toEqual({
            $in: [ApplicationStatus.CONSULTATION_PENDING, ApplicationStatus.CONSULTATION_COMPLETED],
        });
        expect(update).toEqual({ $set: { status: ApplicationStatus.ADOPTION_REJECTED } });
    });

    it('조회와 전이 사이에 상태가 바뀐 신청은 결과에서 빠진다 (엉뚱한 거절 알림 방지)', async () => {
        const { repository } = setup(
            [candidate('app-2', 'adopter-2'), candidate('app-3', 'adopter-3')],
            [null, {}], // app-2 는 그사이 다른 경로로 상태가 바뀌어 전이 실패
        );

        await expect(repository.rejectOtherOpenApplicationsForPet('pet-1', 'app-1')).resolves.toEqual([
            { applicationId: 'app-3', adopterId: 'adopter-3' },
        ]);
    });
});

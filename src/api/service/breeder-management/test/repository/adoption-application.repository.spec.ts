import { ApplicationStatus } from '../../../../../common/enum/user.enum';
import { AdoptionApplicationRepository } from '../../repository/adoption-application.repository';

describe('브리더 관리 신청 리포지토리 — 확정 후속 쓰기', () => {
    function setup(modifiedCount = 0) {
        const model: any = {
            updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
            updateMany: jest.fn().mockResolvedValue({ modifiedCount }),
        };
        return { repository: new AdoptionApplicationRepository(model), model };
    }

    it('확정 시각을 approvedAt 에 기록한다', async () => {
        const { repository, model } = setup();
        const approvedAt = new Date('2026-09-06T12:00:00.000Z');

        await repository.recordApprovedAt('app-1', approvedAt);

        expect(model.updateOne).toHaveBeenCalledWith({ _id: 'app-1' }, { $set: { approvedAt } });
    });

    it('같은 펫의 처리 중 신청만, 확정 본인 신청은 제외하고 거절 처리한다', async () => {
        const { repository, model } = setup(3);

        await expect(repository.rejectOtherOpenApplicationsForPet('pet-1', 'app-1')).resolves.toBe(3);

        const [filter, update] = model.updateMany.mock.calls[0];
        expect(filter.petId).toBe('pet-1');
        expect(filter._id).toEqual({ $ne: 'app-1' });
        expect(filter.status).toEqual({
            $in: [ApplicationStatus.CONSULTATION_PENDING, ApplicationStatus.CONSULTATION_COMPLETED],
        });
        expect(update).toEqual({ $set: { status: ApplicationStatus.ADOPTION_REJECTED } });
    });

    it('이미 확정·거절된 신청은 일괄 거절 대상에서 빠진다', async () => {
        const { repository, model } = setup();

        await repository.rejectOtherOpenApplicationsForPet('pet-1', 'app-1');

        const [filter] = model.updateMany.mock.calls[0];
        expect(filter.status.$in).not.toContain(ApplicationStatus.ADOPTION_APPROVED);
        expect(filter.status.$in).not.toContain(ApplicationStatus.ADOPTION_REJECTED);
    });
});

import { SenderRole } from '../../../../../schema/chat-message.schema';
import { BreederManagementApplicationWorkflowAdapter } from '../../infrastructure/breeder-management-application-workflow.adapter';

describe('입양 확정 워크플로 어댑터 — 펫 전이·일괄 거절·채팅방 보장', () => {
    function setup() {
        const adoptionApplicationRepository: any = {
            recordApprovedAt: jest.fn().mockResolvedValue(undefined),
            rejectOtherOpenApplicationsForPet: jest.fn().mockResolvedValue(2),
        };
        const availablePetManagementRepository: any = { update: jest.fn().mockResolvedValue({}) };
        const createOrGetRoomUseCase: any = { execute: jest.fn().mockResolvedValue({ id: 'room-1' }) };
        const logger: any = {
            log: jest.fn(),
            logStart: jest.fn(),
            logSuccess: jest.fn(),
            logWarning: jest.fn(),
            logError: jest.fn(),
        };

        const adapter = new BreederManagementApplicationWorkflowAdapter(
            adoptionApplicationRepository,
            {} as any,
            {} as any,
            {} as any,
            {} as any,
            logger,
            {} as any,
            availablePetManagementRepository,
            createOrGetRoomUseCase,
        );

        return {
            adapter,
            adoptionApplicationRepository,
            availablePetManagementRepository,
            createOrGetRoomUseCase,
            logger,
        };
    }

    it('펫을 adopted 로 전이하면서 adoptedAt 을 함께 기록한다', async () => {
        const { adapter, availablePetManagementRepository } = setup();
        const adoptedAt = new Date('2026-09-06T12:00:00.000Z');

        await adapter.markPetAsAdopted('pet-1', adoptedAt);

        expect(availablePetManagementRepository.update).toHaveBeenCalledWith('pet-1', {
            status: 'adopted',
            adoptedAt,
        });
    });

    it('다른 대기 신청 일괄 거절은 리포지토리에 위임하고 건수를 반환한다', async () => {
        const { adapter, adoptionApplicationRepository } = setup();

        await expect(adapter.rejectOtherOpenApplicationsForPet('pet-1', 'app-1')).resolves.toBe(2);
        expect(adoptionApplicationRepository.rejectOtherOpenApplicationsForPet).toHaveBeenCalledWith('pet-1', 'app-1');
    });

    it('채팅방은 브리더를 요청자로, 입양자를 counterpartUserId 로 지정해 create-or-get 을 부른다', async () => {
        const { adapter, createOrGetRoomUseCase } = setup();

        await adapter.ensureChatRoomForApplication({
            breederId: 'breeder-1',
            adopterId: 'adopter-1',
            applicationId: 'app-1',
        });

        expect(createOrGetRoomUseCase.execute).toHaveBeenCalledWith('breeder-1', SenderRole.BREEDER, {
            counterpartUserId: 'adopter-1',
            applicationId: 'app-1',
        });
    });

    it('채팅방 생성이 실패해도 예외를 던지지 않는다 (입양 확정을 되돌리면 안 된다)', async () => {
        const { adapter, createOrGetRoomUseCase, logger } = setup();
        createOrGetRoomUseCase.execute.mockRejectedValueOnce(new Error('kafka down'));

        await expect(
            adapter.ensureChatRoomForApplication({
                breederId: 'breeder-1',
                adopterId: 'adopter-1',
                applicationId: 'app-1',
            }),
        ).resolves.toBeUndefined();
        expect(logger.logError).toHaveBeenCalled();
    });
});

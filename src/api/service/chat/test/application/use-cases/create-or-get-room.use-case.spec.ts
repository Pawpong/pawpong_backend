import { CreateOrGetRoomUseCase } from '../../../application/use-cases/create-or-get-room.use-case';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatParticipantReaderPort } from '../../../application/ports/chat-participant-reader.port';
import { ChatUserBlockManagerPort } from '../../../application/ports/chat-user-block-manager.port';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatRoomStatus } from '../../../../../../schema/chat-room.schema';
import { SenderRole } from '../../../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';

const createdRoom = {
    id: 'room-1',
    participantIds: ['adopter-1', 'breeder-1'],
    participants: [
        { userId: 'adopter-1', role: SenderRole.ADOPTER },
        { userId: 'breeder-1', role: SenderRole.BREEDER },
    ],
    participantKey: 'adopter-1:breeder-1',
    participantStates: [{ userId: 'adopter-1' }, { userId: 'breeder-1' }],
    applicationIds: ['app-1'],
    applicationId: 'app-1',
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

function makeRoomManager(existing: any = null, created: any = createdRoom): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn(),
        findRoomByParticipants: jest.fn().mockResolvedValue(existing),
        findRoomsByParticipantId: jest.fn(),
        createRoom: jest.fn().mockResolvedValue(created),
        activateRoom: jest.fn().mockResolvedValue(existing ?? created),
        updateRoomLastMessage: jest.fn(),
        updateReadMarker: jest.fn(),
        hideRoom: jest.fn(),
    };
}

function makeBroker(): ChatMessageBrokerPort {
    return {
        publishMessage: jest.fn(),
        publishRoomCreated: jest.fn().mockResolvedValue(undefined),
        publishRoomClosed: jest.fn(),
    };
}

function makeParticipantReader(status: UserStatus = UserStatus.ACTIVE): ChatParticipantReaderPort {
    return {
        findParticipant: jest.fn(async (userId: string, role?: SenderRole) => ({
            userId,
            role: role ?? (userId.startsWith('breeder') ? SenderRole.BREEDER : SenderRole.ADOPTER),
            nickname: userId,
            accountStatus: status,
        })),
    };
}

function makeBlockManager(isBlocked = false): ChatUserBlockManagerPort {
    return {
        isBlockedBetween: jest.fn().mockResolvedValue(isBlocked),
        blockUser: jest.fn(),
        unblockUser: jest.fn(),
    };
}

const logger = { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;

describe('CreateOrGetRoomUseCase', () => {
    const policy = new ChatPolicyService();

    it('기존 방은 새로 만들지 않고 같은 ID를 활성화하며 applicationId를 추가한다', async () => {
        const manager = makeRoomManager(createdRoom);
        const broker = makeBroker();
        const useCase = new CreateOrGetRoomUseCase(
            manager,
            broker,
            makeParticipantReader(),
            makeBlockManager(),
            policy,
            logger,
        );
        const result = await useCase.execute('adopter-1', SenderRole.ADOPTER, {
            counterpartUserId: 'breeder-1',
            applicationId: 'app-2',
        });
        expect(result.id).toBe('room-1');
        expect(manager.activateRoom).toHaveBeenCalledWith('room-1', 'app-2');
        expect(manager.createRoom).not.toHaveBeenCalled();
        expect(broker.publishRoomCreated).not.toHaveBeenCalled();
    });

    it('브리더도 입양자에게 먼저 방을 만들 수 있다', async () => {
        const manager = makeRoomManager();
        const broker = makeBroker();
        const useCase = new CreateOrGetRoomUseCase(
            manager,
            broker,
            makeParticipantReader(),
            makeBlockManager(),
            policy,
            logger,
        );
        await useCase.execute('breeder-1', SenderRole.BREEDER, { counterpartUserId: 'adopter-1' });
        expect(manager.createRoom).toHaveBeenCalledWith(
            [
                { userId: 'breeder-1', role: SenderRole.BREEDER },
                { userId: 'adopter-1', role: SenderRole.ADOPTER },
            ],
            undefined,
        );
        expect(broker.publishRoomCreated).toHaveBeenCalledWith(
            expect.objectContaining({ roomId: 'room-1', participantIds: createdRoom.participantIds }),
        );
    });

    it('기존 breederId 요청도 호환한다', async () => {
        const manager = makeRoomManager();
        const useCase = new CreateOrGetRoomUseCase(
            manager,
            makeBroker(),
            makeParticipantReader(),
            makeBlockManager(),
            policy,
            logger,
        );
        await useCase.execute('adopter-1', SenderRole.ADOPTER, { breederId: 'breeder-1' });
        expect(manager.findRoomByParticipants).toHaveBeenCalledWith(['adopter-1', 'breeder-1']);
    });

    it('자기 자신과의 방은 거부한다', async () => {
        const useCase = new CreateOrGetRoomUseCase(
            makeRoomManager(),
            makeBroker(),
            makeParticipantReader(),
            makeBlockManager(),
            policy,
            logger,
        );
        await expect(
            useCase.execute('adopter-1', SenderRole.ADOPTER, { counterpartUserId: 'adopter-1' }),
        ).rejects.toBeInstanceOf(DomainValidationError);
    });

    it('정지된 사용자는 방을 만들거나 다시 열 수 없다', async () => {
        const useCase = new CreateOrGetRoomUseCase(
            makeRoomManager(),
            makeBroker(),
            makeParticipantReader(UserStatus.SUSPENDED),
            makeBlockManager(),
            policy,
            logger,
        );
        await expect(
            useCase.execute('adopter-1', SenderRole.ADOPTER, { counterpartUserId: 'breeder-1' }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('둘 중 한 명이 차단한 관계면 기존 방도 재활성화하지 않는다', async () => {
        const manager = makeRoomManager(createdRoom);
        const useCase = new CreateOrGetRoomUseCase(
            manager,
            makeBroker(),
            makeParticipantReader(),
            makeBlockManager(true),
            policy,
            logger,
        );
        await expect(
            useCase.execute('adopter-1', SenderRole.ADOPTER, { counterpartUserId: 'breeder-1' }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
        expect(manager.activateRoom).not.toHaveBeenCalled();
    });
});

import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatMessageMapperService } from '../../../domain/services/chat-message-mapper.service';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageManagerPort } from '../../../application/ports/chat-message-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatParticipantReaderPort } from '../../../application/ports/chat-participant-reader.port';
import { ChatUserBlockManagerPort } from '../../../application/ports/chat-user-block-manager.port';
import { ChatRoomStatus } from '../../../../../../schema/chat-room.schema';
import { MessageType, SenderRole } from '../../../../../../schema/chat-message.schema';
import { UserStatus } from '../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../../common/error/domain.error';

const room = {
    id: 'room-1',
    participantIds: ['adopter-1', 'breeder-1'],
    participants: [
        { userId: 'adopter-1', role: SenderRole.ADOPTER },
        { userId: 'breeder-1', role: SenderRole.BREEDER },
    ],
    participantKey: 'adopter-1:breeder-1',
    participantStates: [{ userId: 'adopter-1' }, { userId: 'breeder-1' }],
    applicationIds: [],
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

const message = {
    id: 'msg-1',
    roomId: 'room-1',
    senderId: 'adopter-1',
    senderRole: SenderRole.ADOPTER,
    receiverId: 'breeder-1',
    content: '안녕',
    messageType: MessageType.TEXT,
    isRead: false,
    createdAt: new Date(),
};

function makeRoomManager(findResult: any = room): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn().mockResolvedValue(findResult),
        findRoomByParticipants: jest.fn(),
        findRoomsByParticipantId: jest.fn(),
        createRoom: jest.fn(),
        activateRoom: jest.fn(),
        updateRoomLastMessage: jest.fn().mockResolvedValue(undefined),
        updateReadMarker: jest.fn(),
        hideRoom: jest.fn(),
    };
}

function makeMessageManager(): ChatMessageManagerPort {
    return {
        createMessage: jest.fn().mockResolvedValue(message),
        findMessagesByRoomId: jest.fn(),
        markMessagesAsRead: jest.fn(),
        countUnreadMessages: jest.fn().mockResolvedValue(0),
    };
}

function makeBroker(): ChatMessageBrokerPort {
    return {
        publishMessage: jest.fn().mockResolvedValue(undefined),
        publishRoomCreated: jest.fn(),
        publishRoomClosed: jest.fn(),
    };
}

function makeParticipantReader(statusById: Record<string, UserStatus> = {}): ChatParticipantReaderPort {
    return {
        findParticipant: jest.fn(async (userId: string, role?: SenderRole) => ({
            userId,
            role: role!,
            nickname: userId,
            accountStatus: statusById[userId] ?? UserStatus.ACTIVE,
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

describe('SendMessageUseCase', () => {
    const policy = new ChatPolicyService();
    const mapper = new ChatMessageMapperService();

    function makeUseCase(
        roomManager = makeRoomManager(),
        messageManager = makeMessageManager(),
        participantReader = makeParticipantReader(),
        broker = makeBroker(),
        blockManager = makeBlockManager(),
    ) {
        return new SendMessageUseCase(
            roomManager,
            messageManager,
            broker,
            participantReader,
            blockManager,
            policy,
            mapper,
            logger,
        );
    }

    it('상대 ID를 participantIds에서 계산해 메시지를 저장하고 발행한다', async () => {
        const messageManager = makeMessageManager();
        const broker = makeBroker();
        const result = await makeUseCase(makeRoomManager(), messageManager, makeParticipantReader(), broker).execute(
            'adopter-1',
            SenderRole.ADOPTER,
            { roomId: 'room-1', content: '안녕' },
        );
        expect(result.id).toBe('msg-1');
        expect(messageManager.createMessage).toHaveBeenCalledWith(
            expect.objectContaining({ receiverId: 'breeder-1', messageType: MessageType.TEXT }),
        );
        expect(broker.publishMessage).toHaveBeenCalledWith(expect.objectContaining({ messageId: 'msg-1' }));
    });

    it('방이 없으면 DomainNotFoundError', async () => {
        await expect(
            makeUseCase(makeRoomManager(null)).execute('adopter-1', SenderRole.ADOPTER, {
                roomId: 'none',
                content: 'x',
            }),
        ).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('참여자가 아니면 DomainAuthorizationError', async () => {
        await expect(
            makeUseCase().execute('other', SenderRole.ADOPTER, { roomId: 'room-1', content: 'x' }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('정지되거나 탈퇴한 상대에게는 메시지를 보내지 않는다', async () => {
        const participantReader = makeParticipantReader({ 'breeder-1': UserStatus.SUSPENDED });
        await expect(
            makeUseCase(makeRoomManager(), makeMessageManager(), participantReader).execute(
                'adopter-1',
                SenderRole.ADOPTER,
                { roomId: 'room-1', content: 'x' },
            ),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('차단 관계에서는 어느 쪽도 메시지를 보낼 수 없다', async () => {
        await expect(
            makeUseCase(
                makeRoomManager(),
                makeMessageManager(),
                makeParticipantReader(),
                makeBroker(),
                makeBlockManager(true),
            ).execute('adopter-1', SenderRole.ADOPTER, { roomId: 'room-1', content: 'x' }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});

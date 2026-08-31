import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatMessageMapperService } from '../../../domain/services/chat-message-mapper.service';
import { ChatRoomManagerPort, ChatRoomSnapshot } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageManagerPort, ChatMessageSnapshot } from '../../../application/ports/chat-message-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatRoomStatus } from '../../../../../../schema/chat-room.schema';
import { MessageType, SenderRole } from '../../../../../../schema/chat-message.schema';
import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../../common/error/domain.error';
import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';

const room: ChatRoomSnapshot = {
    id: 'room-1',
    adopterId: 'adopter-1',
    breederId: 'breeder-1',
    status: ChatRoomStatus.ACTIVE,
    createdAt: new Date(),
};

const message: ChatMessageSnapshot = {
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

function makeRoomManager(findResult: ChatRoomSnapshot | null = room): ChatRoomManagerPort {
    return {
        findRoomById: jest.fn().mockResolvedValue(findResult),
        findRoomByParticipants: jest.fn(),
        findRoomsByAdopterId: jest.fn(),
        findRoomsByBreederId: jest.fn(),
        createRoom: jest.fn(),
        updateRoomLastMessage: jest.fn().mockResolvedValue(undefined),
        closeRoom: jest.fn(),
    };
}

function makeMessageManager(): {
    manager: ChatMessageManagerPort;
    createMessage: jest.MockedFunction<ChatMessageManagerPort['createMessage']>;
} {
    const createMessage = jest.fn() as jest.MockedFunction<ChatMessageManagerPort['createMessage']>;
    createMessage.mockResolvedValue(message);
    return {
        manager: {
            createMessage,
            findMessagesByRoomId: jest.fn(),
            markMessagesAsRead: jest.fn(),
            countUnreadMessages: jest.fn().mockResolvedValue(0),
        },
        createMessage,
    };
}

function makeBroker(): {
    broker: ChatMessageBrokerPort;
    publishMessage: jest.MockedFunction<ChatMessageBrokerPort['publishMessage']>;
} {
    const publishMessage = jest.fn() as jest.MockedFunction<ChatMessageBrokerPort['publishMessage']>;
    publishMessage.mockResolvedValue(true);
    return {
        broker: {
            publishMessage,
            publishRoomCreated: jest.fn().mockResolvedValue(true),
            publishRoomClosed: jest.fn().mockResolvedValue(true),
        },
        publishMessage,
    };
}

function makeLogger(): CustomLoggerService {
    return {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;
}

describe('SendMessageUseCase', () => {
    const policy = new ChatPolicyService();
    const mapper = new ChatMessageMapperService();

    it('메시지를 저장하고 브로커로 발행한다 (adopter→breeder)', async () => {
        const { manager: messageManager, createMessage } = makeMessageManager();
        const { broker, publishMessage } = makeBroker();
        const useCase = new SendMessageUseCase(makeRoomManager(), messageManager, broker, policy, mapper, makeLogger());
        const result = await useCase.execute('adopter-1', SenderRole.ADOPTER, { roomId: 'room-1', content: '안녕' });
        expect(result.id).toBe('msg-1');
        expect(result.brokerPublished).toBe(true);
        expect(createMessage).toHaveBeenCalledWith(
            expect.objectContaining({ receiverId: 'breeder-1', messageType: MessageType.TEXT }),
        );
        expect(publishMessage).toHaveBeenCalledWith(expect.objectContaining({ messageId: 'msg-1', roomId: 'room-1' }));
    });

    it('방이 없으면 DomainNotFoundError', async () => {
        const useCase = new SendMessageUseCase(
            makeRoomManager(null),
            makeMessageManager().manager,
            makeBroker().broker,
            policy,
            mapper,
            makeLogger(),
        );
        await expect(
            useCase.execute('adopter-1', SenderRole.ADOPTER, { roomId: 'none', content: 'x' }),
        ).rejects.toBeInstanceOf(DomainNotFoundError);
    });

    it('참여자가 아니면 DomainAuthorizationError', async () => {
        const useCase = new SendMessageUseCase(
            makeRoomManager(),
            makeMessageManager().manager,
            makeBroker().broker,
            policy,
            mapper,
            makeLogger(),
        );
        await expect(
            useCase.execute('other', SenderRole.ADOPTER, { roomId: 'room-1', content: 'x' }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('messageType 미지정 시 TEXT 기본값', async () => {
        const { manager: messageManager, createMessage } = makeMessageManager();
        const useCase = new SendMessageUseCase(
            makeRoomManager(),
            messageManager,
            makeBroker().broker,
            policy,
            mapper,
            makeLogger(),
        );
        await useCase.execute('adopter-1', SenderRole.ADOPTER, { roomId: 'room-1', content: '안녕' });
        expect(createMessage).toHaveBeenCalledWith(expect.objectContaining({ messageType: MessageType.TEXT }));
    });

    it('위치 메시지 타입과 본문을 변경하지 않고 저장한다', async () => {
        const { manager: messageManager, createMessage } = makeMessageManager();
        const useCase = new SendMessageUseCase(
            makeRoomManager(),
            messageManager,
            makeBroker().broker,
            policy,
            mapper,
            makeLogger(),
        );
        const content = '__PAWPONG_ATTACHMENT_V1__{"kind":"location","latitude":37.5665,"longitude":126.978}';

        await useCase.execute('adopter-1', SenderRole.ADOPTER, {
            roomId: 'room-1',
            content,
            messageType: MessageType.LOCATION,
        });

        expect(createMessage).toHaveBeenCalledWith(
            expect.objectContaining({ content, messageType: MessageType.LOCATION }),
        );
    });
});

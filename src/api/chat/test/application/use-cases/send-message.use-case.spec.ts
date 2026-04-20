import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case';
import { ChatPolicyService } from '../../../domain/services/chat-policy.service';
import { ChatMessageMapperService } from '../../../domain/services/chat-message-mapper.service';
import { ChatRoomManagerPort } from '../../../application/ports/chat-room-manager.port';
import { ChatMessageManagerPort } from '../../../application/ports/chat-message-manager.port';
import { ChatMessageBrokerPort } from '../../../application/ports/chat-message-broker.port';
import { ChatRoomStatus } from '../../../../../schema/chat-room.schema';
import { MessageType, SenderRole } from '../../../../../schema/chat-message.schema';
import { DomainAuthorizationError, DomainNotFoundError } from '../../../../../common/error/domain.error';

const room = {
    id: 'room-1',
    adopterId: 'adopter-1',
    breederId: 'breeder-1',
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
        findRoomsByAdopterId: jest.fn(),
        findRoomsByBreederId: jest.fn(),
        createRoom: jest.fn(),
        updateRoomLastMessage: jest.fn().mockResolvedValue(undefined),
        closeRoom: jest.fn(),
    };
}

function makeMessageManager(): ChatMessageManagerPort {
    return {
        createMessage: jest.fn().mockResolvedValue(message),
        findMessagesByRoomId: jest.fn(),
        markMessagesAsRead: jest.fn(),
    };
}

function makeBroker(): ChatMessageBrokerPort {
    return {
        publishMessage: jest.fn().mockResolvedValue(undefined),
        publishRoomCreated: jest.fn(),
        publishRoomClosed: jest.fn(),
    };
}

function makeLogger() {
    return { logStart: jest.fn(), logSuccess: jest.fn(), logError: jest.fn() } as any;
}

describe('SendMessageUseCase', () => {
    const policy = new ChatPolicyService();
    const mapper = new ChatMessageMapperService();

    it('메시지를 저장하고 브로커로 발행한다 (adopter→breeder)', async () => {
        const messageManager = makeMessageManager();
        const broker = makeBroker();
        const useCase = new SendMessageUseCase(
            makeRoomManager(),
            messageManager,
            broker,
            policy,
            mapper,
            makeLogger(),
        );
        const result = await useCase.execute('adopter-1', SenderRole.ADOPTER, { roomId: 'room-1', content: '안녕' });
        expect(result.id).toBe('msg-1');
        expect(messageManager.createMessage).toHaveBeenCalledWith(
            expect.objectContaining({ receiverId: 'breeder-1', messageType: MessageType.TEXT }),
        );
        expect(broker.publishMessage).toHaveBeenCalledWith(
            expect.objectContaining({ messageId: 'msg-1', roomId: 'room-1' }),
        );
    });

    it('방이 없으면 DomainNotFoundError', async () => {
        const useCase = new SendMessageUseCase(
            makeRoomManager(null),
            makeMessageManager(),
            makeBroker(),
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
            makeMessageManager(),
            makeBroker(),
            policy,
            mapper,
            makeLogger(),
        );
        await expect(
            useCase.execute('other', SenderRole.ADOPTER, { roomId: 'room-1', content: 'x' }),
        ).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('messageType 미지정 시 TEXT 기본값', async () => {
        const messageManager = makeMessageManager();
        const useCase = new SendMessageUseCase(
            makeRoomManager(),
            messageManager,
            makeBroker(),
            policy,
            mapper,
            makeLogger(),
        );
        await useCase.execute('adopter-1', SenderRole.ADOPTER, { roomId: 'room-1', content: '안녕' });
        expect(messageManager.createMessage).toHaveBeenCalledWith(
            expect.objectContaining({ messageType: MessageType.TEXT }),
        );
    });
});

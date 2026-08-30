import { MessageType, SenderRole } from '../../../../schema/chat-message.schema';
import { ChatGateway } from '../chat.gateway';

describe('ChatGateway', () => {
    const message = {
        id: 'message-1',
        roomId: 'room-1',
        senderId: 'adopter-1',
        senderRole: SenderRole.ADOPTER,
        receiverId: 'breeder-1',
        content: '안녕',
        messageType: MessageType.TEXT,
        isRead: false,
        createdAt: new Date('2026-08-31T00:00:00.000Z'),
    };

    const createGateway = (brokerPublished: boolean) => {
        const sendMessageUseCase = {
            execute: jest.fn().mockResolvedValue({ ...message, brokerPublished }),
        };
        const mapper = {
            toBroadcastPayload: jest.fn().mockReturnValue({ ...message, messageId: message.id }),
        };
        const jwtService = {
            verify: jest.fn().mockReturnValue({ sub: 'adopter-1', role: 'adopter' }),
        };
        const gateway = new ChatGateway(
            sendMessageUseCase as any,
            { execute: jest.fn() } as any,
            mapper as any,
            jwtService as any,
            { get: jest.fn().mockReturnValue('test-secret') } as any,
            { logSuccess: jest.fn() } as any,
        );
        const emit = jest.fn();
        const to = jest.fn().mockReturnValue({ emit });
        gateway.server = { to } as any;
        const client = {
            id: 'socket-1',
            handshake: { auth: { token: 'signed-token' }, query: {}, headers: {} },
            disconnect: jest.fn(),
            emit: jest.fn(),
        } as any;

        return { gateway, client, sendMessageUseCase, mapper, to, emit };
    };

    it('Kafka 발행 실패 시 현재 인스턴스에 새 메시지를 직접 전파한다', async () => {
        const context = createGateway(false);
        await context.gateway.handleConnection(context.client);

        await context.gateway.handleSendMessage(context.client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        expect(context.mapper.toBroadcastPayload).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'message-1', brokerPublished: false }),
        );
        expect(context.to).toHaveBeenCalledWith('room-1');
        expect(context.emit).toHaveBeenCalledWith('new_message', expect.objectContaining({ messageId: 'message-1' }));
    });

    it('Kafka 발행 성공 시 consumer의 전파를 기다려 중복 emit하지 않는다', async () => {
        const context = createGateway(true);
        await context.gateway.handleConnection(context.client);

        await context.gateway.handleSendMessage(context.client, {
            roomId: 'room-1',
            content: '안녕',
            messageType: MessageType.TEXT,
        });

        expect(context.mapper.toBroadcastPayload).not.toHaveBeenCalled();
        expect(context.to).not.toHaveBeenCalled();
    });
});

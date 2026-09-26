import { CHAT_BROADCAST_MAX_AGE_MS, ChatKafkaConsumer } from '../chat-kafka.consumer';

describe('ChatKafkaConsumer', () => {
    const setup = () => {
        const gateway = { broadcastNewMessage: jest.fn().mockResolvedValue(undefined) };
        return { gateway, consumer: new ChatKafkaConsumer(gateway as never) };
    };
    const message = (createdAt: unknown) => ({ messageId: 'm1', roomId: 'r1', content: '안녕', createdAt });

    it('방금 쓴 메시지는 전파한다', async () => {
        const { gateway, consumer } = setup();
        await consumer.handleChatMessage(message(new Date(Date.now() - 1_000).toISOString()));
        expect(gateway.broadcastNewMessage).toHaveBeenCalledTimes(1);
    });

    it('재기동 후 다시 읽은 오래된 메시지는 전파하지 않는다', async () => {
        const { gateway, consumer } = setup();
        await consumer.handleChatMessage(
            message(new Date(Date.now() - CHAT_BROADCAST_MAX_AGE_MS - 1_000).toISOString()),
        );
        expect(gateway.broadcastNewMessage).not.toHaveBeenCalled();
    });

    it('문자열 페이로드도 같은 기준으로 판단한다', async () => {
        const { gateway, consumer } = setup();
        await consumer.handleChatMessage(JSON.stringify(message(new Date(Date.now() - 10 * 60_000).toISOString())));
        expect(gateway.broadcastNewMessage).not.toHaveBeenCalled();
    });

    it('작성 시각을 알 수 없으면 누락하지 않도록 전파한다', async () => {
        const { gateway, consumer } = setup();
        await consumer.handleChatMessage(message(undefined));
        await consumer.handleChatMessage(message('not-a-date'));
        expect(gateway.broadcastNewMessage).toHaveBeenCalledTimes(2);
    });
});

import { buildKafkaBroadcastConsumerGroupId } from '../kafka-consumer-group';

describe('buildKafkaBroadcastConsumerGroupId', () => {
    it('blue/green 인스턴스를 서로 다른 consumer group으로 분리한다', () => {
        expect(buildKafkaBroadcastConsumerGroupId(undefined, 'blue')).toBe('pawpong-backend-consumer-group-blue');
        expect(buildKafkaBroadcastConsumerGroupId(undefined, 'green')).toBe('pawpong-backend-consumer-group-green');
    });

    it('Kafka group id에 안전하지 않은 문자를 정규화한다', () => {
        expect(buildKafkaBroadcastConsumerGroupId('pawpong broadcast', 'host/01')).toBe('pawpong-broadcast-host-01');
    });
});

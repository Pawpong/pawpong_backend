const DEFAULT_GROUP_BASE = 'pawpong-backend-consumer-group';

/**
 * WebSocket 브로드캐스트용 Kafka consumer group은 서버 인스턴스마다 달라야 한다.
 * 같은 group을 공유하면 Kafka가 한 인스턴스에만 메시지를 전달해, 다른 인스턴스에
 * 연결된 Socket.IO 클라이언트가 새 메시지를 받지 못한다.
 */
export function buildKafkaBroadcastConsumerGroupId(groupBase?: string, instanceId?: string): string {
    const base = sanitizeSegment(groupBase || DEFAULT_GROUP_BASE, DEFAULT_GROUP_BASE);
    const instance = sanitizeSegment(instanceId || 'local', 'local');
    return `${base}-${instance}`;
}

function sanitizeSegment(value: string, fallback: string): string {
    const sanitized = value
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return sanitized || fallback;
}

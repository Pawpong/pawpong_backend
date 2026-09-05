import { JwtService } from '@nestjs/jwt';
import { Kafka } from 'kafkajs';
import { createConnection, Types } from 'mongoose';
import { io, type Socket } from 'socket.io-client';

interface ChatRoomRecord {
    _id: Types.ObjectId;
    adopterId: string;
    breederId: string;
    status: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    updatedAt?: Date;
}

interface BroadcastMessage {
    messageId: string;
    roomId: string;
    content: string;
    messageType: string;
}

interface MessageEnvelope {
    data?: Array<{ messageId: string; content: string; messageType: string }>;
}

const CHAT_TOPIC = 'chat.message';
const WAIT_TIMEOUT_MS = 10_000;

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitFor = async (predicate: () => boolean | Promise<boolean>, message: string): Promise<void> => {
    const deadline = Date.now() + WAIT_TIMEOUT_MS;
    while (Date.now() < deadline) {
        if (await predicate()) return;
        await delay(50);
    }
    throw new Error(message);
};

const connectSocket = (baseUrl: string, token: string): Promise<Socket> =>
    new Promise((resolve, reject) => {
        const socket = io(`${baseUrl}/chat`, {
            auth: { token },
            transports: ['websocket'],
            forceNew: true,
            reconnection: false,
            timeout: 5_000,
        });
        const timer = setTimeout(() => {
            socket.disconnect();
            reject(new Error('Socket.IO 연결 시간이 초과되었습니다.'));
        }, WAIT_TIMEOUT_MS);

        socket.once('connect', () => {
            clearTimeout(timer);
            resolve(socket);
        });
        socket.once('connect_error', (error) => {
            clearTimeout(timer);
            socket.disconnect();
            reject(error);
        });
    });

const sumTopicOffsets = async (admin: ReturnType<Kafka['admin']>): Promise<bigint> => {
    const offsets = await admin.fetchTopicOffsets(CHAT_TOPIC);
    return offsets.reduce((sum, partition) => sum + BigInt(partition.offset), 0n);
};

const main = async (): Promise<void> => {
    const mongoUri = process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET;
    const broker = process.env.KAFKA_BROKER ?? 'localhost:9092';
    const port = process.env.PORT ?? '8080';
    const baseUrl = `http://localhost:${port}`;

    if (!mongoUri || !jwtSecret) {
        throw new Error('MONGODB_URI와 JWT_SECRET이 필요합니다.');
    }

    const connection = createConnection(mongoUri);
    await connection.asPromise();
    const rooms = connection.collection<ChatRoomRecord>('chat_rooms');
    const messages = connection.collection('chat_messages');
    const requestedRoomId = process.env.CHAT_SMOKE_ROOM_ID;
    if (requestedRoomId && !Types.ObjectId.isValid(requestedRoomId)) {
        await connection.close();
        throw new Error('CHAT_SMOKE_ROOM_ID가 유효한 ObjectId가 아닙니다.');
    }
    const room = requestedRoomId
        ? await rooms.findOne({ _id: new Types.ObjectId(requestedRoomId), status: 'active' })
        : await rooms.findOne({ status: 'active' }, { sort: { lastMessageAt: -1, updatedAt: -1 } });

    if (!room) {
        await connection.close();
        throw new Error('검증할 active 채팅방이 없습니다.');
    }

    const roomId = room._id.toString();
    const jwtService = new JwtService({ secret: jwtSecret });
    const adopterToken = jwtService.sign(
        { sub: room.adopterId, email: 'chat-smoke-adopter@local', role: 'adopter' },
        { expiresIn: '5m' },
    );
    const breederToken = jwtService.sign(
        { sub: room.breederId, email: 'chat-smoke-breeder@local', role: 'breeder' },
        { expiresIn: '5m' },
    );

    const kafka = new Kafka({ clientId: 'pawpong-chat-kafka-smoke', brokers: broker.split(',') });
    const admin = kafka.admin();
    const sockets: Socket[] = [];
    const received = { adopter: [] as BroadcastMessage[], breeder: [] as BroadcastMessage[] };
    const messageType = process.env.CHAT_SMOKE_MESSAGE_TYPE ?? 'text';
    if (!['text', 'image', 'file', 'location'].includes(messageType)) {
        throw new Error(`지원하지 않는 CHAT_SMOKE_MESSAGE_TYPE: ${messageType}`);
    }
    const smokeId = Date.now();
    const content =
        messageType === 'location'
            ? `__PAWPONG_ATTACHMENT_V1__${JSON.stringify({
                  kind: 'location',
                  latitude: 37.5665,
                  longitude: 126.978,
                  accuracy: 15,
                  smokeId,
              })}`
            : `chat-kafka-smoke-${smokeId}`;
    let messageId: string | undefined;

    try {
        await admin.connect();
        const offsetBefore = await sumTopicOffsets(admin);
        const adopterSocket = await connectSocket(baseUrl, adopterToken);
        sockets.push(adopterSocket);
        const breederSocket = await connectSocket(baseUrl, breederToken);
        sockets.push(breederSocket);

        adopterSocket.on('new_message', (message: BroadcastMessage) => {
            if (message.content === content) received.adopter.push(message);
        });
        breederSocket.on('new_message', (message: BroadcastMessage) => {
            if (message.content === content) received.breeder.push(message);
        });

        adopterSocket.emit('join_room', { roomId });
        breederSocket.emit('join_room', { roomId });
        await delay(200);
        adopterSocket.emit('send_message', { roomId, content, messageType });

        await waitFor(
            () => received.adopter.length > 0 && received.breeder.length > 0,
            '양쪽 소켓에서 new_message를 받지 못했습니다.',
        );
        await delay(300);

        if (received.adopter.length !== 1 || received.breeder.length !== 1) {
            throw new Error(
                `new_message 중복 수신: adopter=${received.adopter.length}, breeder=${received.breeder.length}`,
            );
        }

        messageId = received.adopter[0].messageId;
        if (!messageId || received.breeder[0].messageId !== messageId) {
            throw new Error('두 소켓의 messageId가 일치하지 않습니다.');
        }
        if (received.adopter[0].messageType !== messageType || received.breeder[0].messageType !== messageType) {
            throw new Error('두 소켓의 messageType이 요청과 일치하지 않습니다.');
        }

        await waitFor(async () => (await sumTopicOffsets(admin)) > offsetBefore, 'Kafka offset이 증가하지 않았습니다.');
        const offsetAfter = await sumTopicOffsets(admin);
        const response = await fetch(`${baseUrl}/api/v2/chat/rooms/${roomId}/messages?limit=50`, {
            headers: { Authorization: `Bearer ${adopterToken}` },
        });
        const body = (await response.json()) as MessageEnvelope;
        const stored =
            body.data?.filter((message) => message.messageId === messageId && message.messageType === messageType) ??
            [];

        if (!response.ok || stored.length !== 1) {
            throw new Error(`REST 메시지 재조회 실패: status=${response.status}, count=${stored.length}`);
        }

        console.log(`[chat-kafka-smoke] room=${roomId} type=${messageType}`);
        console.log('[chat-kafka-smoke] Socket.IO new_message adopter=1 breeder=1');
        console.log(`[chat-kafka-smoke] Kafka ${CHAT_TOPIC} offset ${offsetBefore} -> ${offsetAfter}`);
        console.log('[chat-kafka-smoke] REST persisted message count=1');
    } finally {
        sockets.forEach((socket) => socket.disconnect());
        await admin.disconnect().catch(() => undefined);

        await messages.deleteMany({ roomId, content });
        const set: Record<string, unknown> = { updatedAt: room.updatedAt };
        const unset: Record<string, ''> = {};

        if (room.lastMessage === undefined) unset.lastMessage = '';
        else set.lastMessage = room.lastMessage;
        if (room.lastMessageAt === undefined) unset.lastMessageAt = '';
        else set.lastMessageAt = room.lastMessageAt;
        if (room.updatedAt === undefined) {
            delete set.updatedAt;
            unset.updatedAt = '';
        }

        await rooms.updateOne({ _id: room._id }, { $set: set, $unset: unset });
        await connection.close();

        if (messageId) console.log('[chat-kafka-smoke] test message cleaned');
    }
};

void main().catch((error: unknown) => {
    console.error(`[chat-kafka-smoke] FAILED: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
});

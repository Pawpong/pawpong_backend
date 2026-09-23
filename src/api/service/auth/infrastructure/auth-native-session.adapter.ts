import { createHash } from 'node:crypto';
import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import type {
    AuthNativeSessionPort,
    NativeAuthSession,
    NativeAuthHandoff,
} from '../application/ports/auth-native-session.port';

const SESSION_TTL_SECONDS = 600;
const HANDOFF_TTL_SECONDS = 90;
const START_LIMIT = 30;

export const LIMIT_NATIVE_START = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

/** Redis 6도 지원하면서 검증과 삭제를 같은 원자적 연산으로 수행한다. */
export const CONSUME_NATIVE_SESSION = `
local value = redis.call('GET', KEYS[1])
if value then redis.call('DEL', KEYS[1]) end
return value
`;

export const CONSUME_NATIVE_HANDOFF = `
local value = redis.call('GET', KEYS[1])
if not value then return nil end
local data = cjson.decode(value)
if data.state ~= ARGV[1] or data.codeChallenge ~= ARGV[2] then return nil end
redis.call('DEL', KEYS[1])
return value
`;

/** 인증 교환은 메모리 폴백 없이 공유 Redis가 살아 있을 때만 수행한다. */
@Injectable()
export class AuthNativeSessionAdapter implements AuthNativeSessionPort, OnModuleDestroy {
    private readonly client: Redis;
    private connecting?: Promise<void>;

    constructor(config: ConfigService) {
        this.client = new Redis({
            host: config.get<string>('REDIS_HOST') || 'localhost',
            port: Number(config.get<string>('REDIS_PORT') || 6379),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
            db: 0,
            lazyConnect: true,
            enableOfflineQueue: false,
            maxRetriesPerRequest: 0,
            connectTimeout: 1500,
            commandTimeout: 1500,
            retryStrategy: () => null,
        });
        // 연결 예외 원문에는 서버 정보가 들어갈 수 있어 호출부의 고정된 오류로만 전달한다.
        this.client.on('error', () => {});
    }

    private key(kind: 'state' | 'handoff' | 'start-limit', value: string): string {
        return `auth:native-google:${kind}:${createHash('sha256').update(value).digest('hex')}`;
    }

    /** IP는 엔드포인트의 명시적 proxy trust로 해석한 값을 사용하며 원문은 Redis에 보관하지 않는다. */
    async allowStart(clientIp: string): Promise<boolean> {
        return this.execute(async () => {
            const normalizedIp = clientIp
                .trim()
                .toLowerCase()
                .replace(/^::ffff:/, '');
            const count = await this.client.eval(
                LIMIT_NATIVE_START,
                1,
                this.key('start-limit', normalizedIp),
                SESSION_TTL_SECONDS,
            );
            return typeof count === 'number' && count <= START_LIMIT;
        });
    }

    private async execute<T>(operation: () => Promise<T>): Promise<T> {
        try {
            if (this.client.status !== 'ready') {
                this.connecting ??= this.client.connect().finally(() => {
                    this.connecting = undefined;
                });
                await this.connecting;
            }
            return await operation();
        } catch {
            throw new ServiceUnavailableException('앱 로그인을 잠시 사용할 수 없습니다. 다시 시도해주세요.');
        }
    }

    /** 중복 state가 기존 세션을 덮어쓰지 않도록 NX로 저장한다. */
    async saveSession(state: string, session: NativeAuthSession): Promise<void> {
        await this.execute(async () => {
            if (
                (await this.client.set(
                    this.key('state', state),
                    JSON.stringify(session),
                    'EX',
                    SESSION_TTL_SECONDS,
                    'NX',
                )) !== 'OK'
            ) {
                throw new Error('Native session collision');
            }
        });
    }

    /** Google 콜백의 중복 요청이 계정 토큰을 여러 번 발급하지 못하도록 먼저 소비한다. */
    async consumeSession(state: string): Promise<NativeAuthSession | null> {
        return this.execute(async () => {
            const value = await this.client.eval(CONSUME_NATIVE_SESSION, 1, this.key('state', state));
            return typeof value === 'string' ? (JSON.parse(value) as NativeAuthSession) : null;
        });
    }

    /** 세션 토큰이 담긴 서버 내부 결과는 90초 뒤 반드시 만료된다. */
    async saveHandoff(code: string, handoff: NativeAuthHandoff): Promise<void> {
        await this.execute(async () => {
            if (
                (await this.client.set(
                    this.key('handoff', code),
                    JSON.stringify(handoff),
                    'EX',
                    HANDOFF_TTL_SECONDS,
                    'NX',
                )) !== 'OK'
            ) {
                throw new Error('Native handoff collision');
            }
        });
    }

    /** state와 PKCE가 둘 다 맞을 때에만 코드를 삭제해 동시 재사용을 막는다. */
    async consumeHandoff(code: string, state: string, codeChallenge: string): Promise<NativeAuthHandoff | null> {
        return this.execute(async () => {
            const value = await this.client.eval(
                CONSUME_NATIVE_HANDOFF,
                1,
                this.key('handoff', code),
                state,
                codeChallenge,
            );
            return typeof value === 'string' ? (JSON.parse(value) as NativeAuthHandoff) : null;
        });
    }

    /** 앱 종료 시 인증 전용 Redis 연결을 닫는다. */
    onModuleDestroy(): void {
        this.client.disconnect();
    }
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

@Injectable()
export class AppleTokenCipherService {
    constructor(private readonly config: ConfigService) {}

    /** JWT 서명키와 별도의 256-bit 운영 키를 사용한다. 키 누락 시 평문 저장으로 우회하지 않는다. */
    private key(): Buffer {
        const raw = this.config.get<string>('APPLE_TOKEN_ENCRYPTION_KEY') || '';
        if (!/^[a-f0-9]{64}$/i.test(raw)) {
            throw new ServiceUnavailableException('Apple 인증 저장소가 준비되지 않았습니다.');
        }
        return Buffer.from(raw, 'hex');
    }

    /** 컬렉션 조회용 식별자는 원본 Apple sub 대신 전용 키로 만든 HMAC이다. */
    digest(subject: string): string {
        return createHmac('sha256', this.key()).update(`apple-subject:${subject}`).digest('hex');
    }

    /** 다른 사용자 암호문을 바꿔 끼우는 것도 GCM 추가 인증 데이터로 거부한다. */
    encrypt(token: string, subjectDigest: string): string {
        const iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', this.key(), iv);
        cipher.setAAD(Buffer.from(subjectDigest));
        const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
        return [
            'v1',
            iv.toString('base64url'),
            cipher.getAuthTag().toString('base64url'),
            encrypted.toString('base64url'),
        ].join('.');
    }

    /** 인증 태그·사용자·암호문 중 하나라도 달라지면 복호화하지 않는다. */
    decrypt(value: string, subjectDigest: string): string {
        const [version, iv, tag, data, extra] = value.split('.');
        if (version !== 'v1' || !iv || !tag || !data || extra) throw new Error('Invalid Apple credential envelope');
        const decipher = createDecipheriv('aes-256-gcm', this.key(), Buffer.from(iv, 'base64url'));
        decipher.setAAD(Buffer.from(subjectDigest));
        decipher.setAuthTag(Buffer.from(tag, 'base64url'));
        return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
    }
}

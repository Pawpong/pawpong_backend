import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { ReviewPasswordPort } from '../application/review-login.port';

@Injectable()
export class ReviewPasswordAdapter implements ReviewPasswordPort {
    private readonly dummyHash = bcrypt.hash(randomBytes(32).toString('hex'), 12);

    /** bcrypt의 72바이트 절삭으로 서로 다른 비밀번호가 같아지는 것을 허용하지 않는다. */
    async verify(password: string, passwordHash: string | null): Promise<boolean> {
        const validInput = Buffer.byteLength(password, 'utf8') <= 72 && password.length > 0;
        const validHash = typeof passwordHash === 'string' && /^\$2[aby]\$12\$[./A-Za-z0-9]{53}$/.test(passwordHash);
        const matched = await bcrypt.compare(
            validInput ? password : 'invalid-review-password',
            validHash ? passwordHash : await this.dummyHash,
        );
        return validInput && validHash && matched;
    }
}

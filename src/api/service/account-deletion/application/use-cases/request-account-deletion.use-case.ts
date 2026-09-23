import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'crypto';
import { ACCOUNT_DELETION_STORE, type AccountDeletionStore, type DeletionJob } from '../ports/account-deletion.port';

export const PERMANENT_DELETION_CONFIRMATION = 'DELETE_PERMANENTLY';

/** 타인 ID는 입력으로 받지 않고 인증된 본인의 작업만 만든다. */
@Injectable()
export class RequestAccountDeletionUseCase {
    constructor(@Inject(ACCOUNT_DELETION_STORE) private readonly store: AccountDeletionStore) {}

    async execute(
        accountId: string,
        role: string,
        confirmation: string,
        prepared?: { requestId?: string; receiptToken?: string },
    ) {
        if (confirmation !== PERMANENT_DELETION_CONFIRMATION || !['adopter', 'breeder'].includes(role)) {
            throw new BadRequestException('영구 삭제 확인 값이 필요합니다.');
        }
        if (
            prepared &&
            (prepared.requestId !== undefined || prepared.receiptToken !== undefined) &&
            (!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(prepared.requestId ?? '') ||
                !/^[A-Za-z0-9_-]{43}$/.test(prepared.receiptToken ?? ''))
        ) {
            throw new BadRequestException('접수 영수증 정보가 올바르지 않습니다.');
        }
        const receiptToken = prepared?.receiptToken ?? randomBytes(32).toString('base64url');
        const job = await this.store.request(
            accountId,
            role as 'adopter' | 'breeder',
            prepared?.requestId ?? randomUUID(),
            receiptHash(receiptToken),
        );
        return { ...publicDeletionStatus(job), receiptToken };
    }
}

export function receiptHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

/** 로그아웃 뒤에는 고엔트로피 영수증으로만 최소 상태를 조회한다. */
@Injectable()
export class GetAccountDeletionStatusUseCase {
    constructor(@Inject(ACCOUNT_DELETION_STORE) private readonly store: AccountDeletionStore) {}

    async execute(requestId: string, receiptToken: string) {
        const job = await this.store.find(requestId);
        const expected = Buffer.from(job?.receiptHash ?? '0'.repeat(64), 'hex');
        const supplied = Buffer.from(receiptHash(receiptToken), 'hex');
        if (!job || expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
            throw new NotFoundException('삭제 요청을 확인할 수 없습니다.');
        }
        return publicDeletionStatus(job);
    }
}

export function publicDeletionStatus(job: DeletionJob) {
    return {
        requestId: job.requestId,
        status: job.status,
        requestedAt: job.requestedAt.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        appleConnectionRemovalRequired: job.appleConnectionRemovalRequired,
    };
}

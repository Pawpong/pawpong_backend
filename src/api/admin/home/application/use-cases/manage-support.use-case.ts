import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SUPPORT_MANAGEMENT_PORT } from '../ports/support-management.port';
import type { SupportManagementPort, SupportStatus, SupportUpdate } from '../ports/support-management.port';

/** 처리 상태는 Discord 반응이 아니라 인증된 관리자 작업을 기준으로 관리한다. */
@Injectable()
export class ManageSupportUseCase {
    constructor(
        @Inject(SUPPORT_MANAGEMENT_PORT) private readonly port: SupportManagementPort,
        private readonly config: ConfigService,
    ) {}
    /** 환경별 접수 목록을 제공한다. */
    list(page: number, status?: SupportStatus, receiptId?: string) {
        return this.port.list(this.environment(), page, status, receiptId);
    }
    /** 담당자 지정·해결·재개를 기록하며 해결 시 처리 내용을 요구한다. */
    async update(eventId: string, actorId: string, command: SupportUpdate) {
        if (command.status === 'resolved' && !command.note?.trim())
            throw new BadRequestException('처리 완료 내용을 입력해주세요.');
        const result = await this.port.update(this.environment(), eventId, actorId, command);
        if (!result) throw new ConflictException('접수가 변경되었거나 없습니다. 새로고침 후 다시 시도해주세요.');
        return result;
    }
    private environment() {
        return this.config.get<string>('APP_ENV') || this.config.get<string>('NODE_ENV') || 'development';
    }
}

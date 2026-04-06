import { Injectable } from '@nestjs/common';

import { BreederSuspendRequestDto } from './dto/request/breeder-suspend-request.dto';
import { BreederRemindRequestDto } from './dto/request/breeder-remind-request.dto';
import { BreederSuspendResponseDto } from './dto/response/breeder-suspend-response.dto';
import { BreederRemindResponseDto } from './dto/response/breeder-remind-response.dto';
import { SetTestAccountResponseDto } from './dto/response/set-test-account-response.dto';
import { SuspendBreederUseCase } from './application/use-cases/suspend-breeder.use-case';
import { UnsuspendBreederUseCase } from './application/use-cases/unsuspend-breeder.use-case';
import { SendBreederRemindNotificationsUseCase } from './application/use-cases/send-breeder-remind-notifications.use-case';
import { SetBreederTestAccountUseCase } from './application/use-cases/set-breeder-test-account.use-case';

/**
 * 브리더 관리 Admin 서비스
 *
 * 브리더 도메인에 대한 관리자 기능을 제공합니다:
 * - 브리더 제재 처리 (정지/해제)
 * - 리마인드 알림 발송
 * - 테스트 계정 설정
 *
 * 분리된 기능:
 * - 브리더 인증 관리 → BreederVerificationAdminService
 * - 브리더 레벨 변경 → BreederVerificationAdminService
 */
@Injectable()
export class BreederAdminService {
    constructor(
        private readonly suspendBreederUseCase: SuspendBreederUseCase,
        private readonly unsuspendBreederUseCase: UnsuspendBreederUseCase,
        private readonly sendBreederRemindNotificationsUseCase: SendBreederRemindNotificationsUseCase,
        private readonly setBreederTestAccountUseCase: SetBreederTestAccountUseCase,
    ) {}

    /**
     * 브리더 제재 처리 (영구정지)
     *
     * 브리더 계정을 영구정지 처리하고 알림을 발송합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param suspendData 제재 데이터
     * @returns 제재 처리 결과
     */
    async suspendBreeder(
        adminId: string,
        breederId: string,
        suspendData: BreederSuspendRequestDto,
    ): Promise<BreederSuspendResponseDto> {
        return this.suspendBreederUseCase.execute(adminId, breederId, suspendData);
    }

    /**
     * 브리더 계정 정지 해제
     *
     * 정지된 브리더 계정을 활성화하고 알림을 발송합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @returns 정지 해제 처리 결과
     */
    async unsuspendBreeder(adminId: string, breederId: string): Promise<BreederSuspendResponseDto> {
        return this.unsuspendBreederUseCase.execute(adminId, breederId);
    }

    /**
     * 리마인드 알림 발송
     *
     * 브리더들에게 리마인드 알림을 발송합니다.
     * - DOCUMENT_REMINDER: 서류 미제출 브리더 대상 (입점 심사 독촉)
     * - PROFILE_COMPLETION_REMINDER: 프로필 미완성 브리더 대상 (프로필 완성 독려)
     *
     * @param adminId 관리자 고유 ID
     * @param remindData 리마인드 데이터
     * @returns 발송 결과
     */
    async sendRemindNotifications(
        adminId: string,
        remindData: BreederRemindRequestDto,
    ): Promise<BreederRemindResponseDto> {
        return this.sendBreederRemindNotificationsUseCase.execute(adminId, remindData);
    }

    /**
     * 테스트 계정 설정/해제
     *
     * 브리더를 테스트 계정으로 설정하거나 해제합니다.
     * 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param isTestAccount 테스트 계정 여부
     * @returns 설정 결과
     */
    async setTestAccount(
        adminId: string,
        breederId: string,
        isTestAccount: boolean,
    ): Promise<SetTestAccountResponseDto> {
        return this.setBreederTestAccountUseCase.execute(adminId, breederId, isTestAccount);
    }
}

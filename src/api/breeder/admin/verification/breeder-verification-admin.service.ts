import { Injectable } from '@nestjs/common';

import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederLevelChangeRequestDto } from './dto/request/breeder-level-change-request.dto';
import { BreederVerificationRequestDto } from './dto/request/breeder-verification-request.dto';
import { GetLevelChangeRequestsUseCase } from './application/use-cases/get-level-change-requests.use-case';
import { GetPendingBreederVerificationsUseCase } from './application/use-cases/get-pending-breeder-verifications.use-case';
import { GetBreedersUseCase } from './application/use-cases/get-breeders.use-case';
import { UpdateBreederVerificationUseCase } from './application/use-cases/update-breeder-verification.use-case';
import { GetBreederDetailUseCase } from './application/use-cases/get-breeder-detail.use-case';
import { GetBreederStatsUseCase } from './application/use-cases/get-breeder-stats.use-case';
import { SendDocumentRemindersUseCase } from './application/use-cases/send-document-reminders.use-case';
import { ChangeBreederLevelUseCase } from './application/use-cases/change-breeder-level.use-case';

/**
 * 브리더 인증 관리 Admin 서비스
 *
 * 브리더 인증 승인/거절 기능을 제공합니다.
 */
@Injectable()
export class BreederVerificationAdminService {
    constructor(
        private readonly getLevelChangeRequestsUseCase: GetLevelChangeRequestsUseCase,
        private readonly getPendingBreederVerificationsUseCase: GetPendingBreederVerificationsUseCase,
        private readonly getBreedersUseCase: GetBreedersUseCase,
        private readonly updateBreederVerificationUseCase: UpdateBreederVerificationUseCase,
        private readonly getBreederDetailUseCase: GetBreederDetailUseCase,
        private readonly getBreederStatsUseCase: GetBreederStatsUseCase,
        private readonly sendDocumentRemindersUseCase: SendDocumentRemindersUseCase,
        private readonly changeBreederLevelUseCase: ChangeBreederLevelUseCase,
    ) {}

    /**
     * 레벨 변경 신청 목록 조회
     */
    async getLevelChangeRequests(adminId: string, filter: BreederSearchRequestDto): Promise<any> {
        return this.getLevelChangeRequestsUseCase.execute(adminId, filter);
    }

    /**
     * 승인 대기 중인 브리더 목록 조회
     */
    async getPendingBreederVerifications(adminId: string, filter: BreederSearchRequestDto): Promise<any> {
        return this.getPendingBreederVerificationsUseCase.execute(adminId, filter);
    }

    /**
     * 브리더 목록 조회 (통합 검색)
     */
    async getBreeders(adminId: string, filter: BreederSearchRequestDto): Promise<any> {
        return this.getBreedersUseCase.execute(adminId, filter);
    }

    /**
     * 브리더 인증 승인/거절
     */
    async updateBreederVerification(adminId: string, breederId: string, verificationData: BreederVerificationRequestDto): Promise<any> {
        return this.updateBreederVerificationUseCase.execute(adminId, breederId, verificationData);
    }

    /**
     * 브리더 상세 정보 조회
     *
     * 특정 브리더의 상세 정보를 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @returns 브리더 상세 정보
     */
    async getBreederDetail(adminId: string, breederId: string): Promise<any> {
        return this.getBreederDetailUseCase.execute(adminId, breederId);
    }

    /**
     * 승인된 브리더 통계 조회
     *
     * 전체 승인된 브리더의 레벨별 통계를 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @returns 브리더 통계 정보
     */
    async getBreederStats(adminId: string): Promise<any> {
        return this.getBreederStatsUseCase.execute(adminId);
    }

    /**
     * 서류 미제출 브리더에게 독촉 메일 발송
     *
     * 승인 후 4주 경과했지만 서류를 제출하지 않은 브리더들을 찾아서
     * 독촉 이메일을 발송합니다.
     *
     * @param adminId 관리자 고유 ID
     * @returns 발송 성공한 브리더 수
     */
    async sendDocumentReminders(adminId: string): Promise<{ sentCount: number; breederIds: string[] }> {
        return this.sendDocumentRemindersUseCase.execute(adminId);
    }

    /**
     * 브리더 레벨 변경
     *
     * 승인된 브리더의 레벨을 뉴 ↔ 엘리트로 변경합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param levelData 레벨 변경 데이터
     * @returns 변경 결과
     */
    async changeBreederLevel(adminId: string, breederId: string, levelData: BreederLevelChangeRequestDto): Promise<any> {
        return this.changeBreederLevelUseCase.execute(adminId, breederId, levelData);
    }
}

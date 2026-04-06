import { Injectable } from '@nestjs/common';

import { ApplicationListRequestDto } from './dto/request/application-list-request.dto';
import { AdminApplicationListResponseDto } from './dto/response/application-list-response.dto';
import { AdminApplicationDetailResponseDto } from './dto/response/application-detail-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { ReviewReportItemDto } from './dto/response/review-report-list.dto';
import { GetAdopterAdminReviewReportsUseCase } from './application/use-cases/get-adopter-admin-review-reports.use-case';
import { DeleteAdopterAdminReviewUseCase } from './application/use-cases/delete-adopter-admin-review.use-case';
import { GetAdopterAdminApplicationListUseCase } from './application/use-cases/get-adopter-admin-application-list.use-case';
import { GetAdopterAdminApplicationDetailUseCase } from './application/use-cases/get-adopter-admin-application-detail.use-case';

/**
 * 입양자 관리 Admin 서비스
 *
 * 입양자 도메인에 대한 관리자 기능을 제공합니다:
 * - 후기 신고 관리
 * - 부적절한 후기 삭제
 * - 입양 신청 모니터링
 */
@Injectable()
export class AdopterAdminService {
    constructor(
        private readonly getAdopterAdminReviewReportsUseCase: GetAdopterAdminReviewReportsUseCase,
        private readonly deleteAdopterAdminReviewUseCase: DeleteAdopterAdminReviewUseCase,
        private readonly getAdopterAdminApplicationListUseCase: GetAdopterAdminApplicationListUseCase,
        private readonly getAdopterAdminApplicationDetailUseCase: GetAdopterAdminApplicationDetailUseCase,
    ) {}

    /**
     * 후기 신고 목록 조회
     *
     * 신고된 후기 목록을 페이지네이션과 함께 조회합니다.
     * BreederReview 컬렉션에서 isReported가 true인 후기들을 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param pageStr 페이지 번호 (문자열)
     * @param limitStr 페이지당 항목 수 (문자열)
     * @returns 신고된 후기 목록과 페이지네이션 정보
     * @throws ForbiddenException 권한 없음
     */
    async getReviewReports(
        adminId: string,
        pageStr: string = '1',
        limitStr: string = '10',
    ): Promise<PaginationResponseDto<ReviewReportItemDto>> {
        return this.getAdopterAdminReviewReportsUseCase.execute(adminId, pageStr, limitStr);
    }

    /**
     * 부적절한 후기 삭제
     *
     * 신고된 부적절한 후기를 삭제합니다 (isVisible = false로 설정).
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param reviewId 후기 고유 ID
     * @returns 삭제 결과
     * @throws ForbiddenException 권한 없음
     * @throws BadRequestException 후기를 찾을 수 없음
     */
    async deleteReview(adminId: string, breederId: string, reviewId: string): Promise<any> {
        return this.deleteAdopterAdminReviewUseCase.execute(adminId, breederId, reviewId);
    }

    /**
     * 입양 신청 리스트 조회 (플랫폼 어드민용)
     *
     * 전체 입양 신청 내역을 조회합니다.
     * 상태별 필터링, 브리더 이름 검색, 날짜 범위 필터링을 지원합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param filters 필터 조건 (page, limit, status, breederName, startDate, endDate)
     * @returns 입양 신청 목록 및 상태별 통계
     */
    async getApplicationList(
        adminId: string,
        filters: ApplicationListRequestDto,
    ): Promise<AdminApplicationListResponseDto> {
        return this.getAdopterAdminApplicationListUseCase.execute(adminId, filters);
    }

    /**
     * 입양 신청 상세 조회 (플랫폼 어드민용)
     *
     * 특정 입양 신청의 상세 정보를 조회합니다.
     * 표준 신청 응답, 커스텀 질문 응답, 브리더 메모 등 전체 정보를 제공합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param applicationId 입양 신청 고유 ID
     * @returns 입양 신청 상세 정보
     */
    async getApplicationDetail(adminId: string, applicationId: string): Promise<AdminApplicationDetailResponseDto> {
        return this.getAdopterAdminApplicationDetailUseCase.execute(adminId, applicationId);
    }
}

import { Injectable } from '@nestjs/common';

import { CreateAdopterApplicationUseCase } from './application/use-cases/create-adopter-application.use-case';
import { CreateAdopterReportUseCase } from './application/use-cases/create-adopter-report.use-case';
import { GetAdopterApplicationsUseCase } from './application/use-cases/get-adopter-applications.use-case';
import { GetAdopterApplicationDetailUseCase } from './application/use-cases/get-adopter-application-detail.use-case';
import { CreateAdopterReviewUseCase } from './application/use-cases/create-adopter-review.use-case';
import { ReportAdopterReviewUseCase } from './application/use-cases/report-adopter-review.use-case';
import { GetAdopterReviewsUseCase } from './application/use-cases/get-adopter-reviews.use-case';
import { GetAdopterReviewDetailUseCase } from './application/use-cases/get-adopter-review-detail.use-case';
import { DeleteAdopterAccountUseCase } from './application/use-cases/delete-adopter-account.use-case';
import { GetAdopterProfileUseCase } from './application/use-cases/get-adopter-profile.use-case';
import { UpdateAdopterProfileUseCase } from './application/use-cases/update-adopter-profile.use-case';
import { AddFavoriteBreederUseCase } from './application/use-cases/add-favorite-breeder.use-case';
import { RemoveFavoriteBreederUseCase } from './application/use-cases/remove-favorite-breeder.use-case';
import { GetFavoriteBreedersUseCase } from './application/use-cases/get-favorite-breeders.use-case';

import { FavoriteAddRequestDto } from './dto/request/favorite-add-request.dto';
import { ReviewCreateRequestDto } from './dto/request/review-create-request.dto';
import { ReportCreateRequestDto } from './dto/request/report-create-request.dto';
import { AccountDeleteRequestDto } from './dto/request/account-delete-request.dto';
import { ApplicationCreateRequestDto } from './dto/request/application-create-request.dto';
import { AccountDeleteResponseDto } from './dto/response/account-delete-response.dto';
import { AdopterProfileResponseDto } from './dto/response/adopter-profile-response.dto';

/**
 * 입양자 비즈니스 로직 처리 Service
 *
 * 역할:
 * - 입양 신청, 후기 작성, 즐겨찾기, 신고 등 입양자 핵심 기능 처리
 * - Repository 계층과 Controller 계층 사이의 비즈니스 로직 담당
 * - 복잡한 비즈니스 규칙 검증 및 데이터 일관성 보장
 * - 도메인 간 데이터 동기화 및 관계 관리
 *
 * 설계 원칙:
 * - 단일 책임 원칙: 입양자 도메인 비즈니스 로직만 담당
 * - 의존성 주입: Repository를 통한 데이터 접근
 * - 트랜잭션 일관성: 관련 데이터 동시 업데이트
 * - 예외 안전성: 모든 에러 케이스 대응
 */
@Injectable()
export class AdopterService {
    constructor(
        private readonly getAdopterProfileUseCase: GetAdopterProfileUseCase,
        private readonly updateAdopterProfileUseCase: UpdateAdopterProfileUseCase,
        private readonly addFavoriteBreederUseCase: AddFavoriteBreederUseCase,
        private readonly removeFavoriteBreederUseCase: RemoveFavoriteBreederUseCase,
        private readonly getFavoriteBreedersUseCase: GetFavoriteBreedersUseCase,
        private readonly createAdopterApplicationUseCase: CreateAdopterApplicationUseCase,
        private readonly createAdopterReportUseCase: CreateAdopterReportUseCase,
        private readonly getAdopterApplicationsUseCase: GetAdopterApplicationsUseCase,
        private readonly getAdopterApplicationDetailUseCase: GetAdopterApplicationDetailUseCase,
        private readonly createAdopterReviewUseCase: CreateAdopterReviewUseCase,
        private readonly reportAdopterReviewUseCase: ReportAdopterReviewUseCase,
        private readonly getAdopterReviewsUseCase: GetAdopterReviewsUseCase,
        private readonly getAdopterReviewDetailUseCase: GetAdopterReviewDetailUseCase,
        private readonly deleteAdopterAccountUseCase: DeleteAdopterAccountUseCase,
    ) {}

    /**
     * 입양 신청서 제출 처리
     *
     * 별도 컬렉션(adoption_applications)에 신청 정보를 저장합니다.
     * 입양자와 브리더 양쪽에서 이 컬렉션을 참조합니다.
     *
     * 비즈니스 규칙:
     * - 입양자 또는 브리더 계정 상태 확인 필수
     * - 브리더 존재 여부 검증
     * - 반려동물 ID는 선택사항 (특정 개체 또는 전체 상담)
     * - 개인정보 수집 동의 필수
     * - 중복 신청 방지 검증 (같은 브리더에게 대기 중인 신청이 있는 경우)
     *
     * @param userId 신청자 고유 ID (JWT에서 추출)
     * @param dto 입양 신청 데이터 (Figma 디자인 기반 필드)
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 생성된 신청서 정보
     * @throws BadRequestException 잘못된 요청 데이터
     * @throws ConflictException 중복 신청 시도
     */
    async createApplication(userId: string, dto: ApplicationCreateRequestDto, userRole?: string): Promise<any> {
        return this.createAdopterApplicationUseCase.execute(userId, dto, userRole);
    }

    /**
     * 입양 후기 작성 처리
     *
     * 변경사항:
     * - 상담 완료된 입양 신청에 대해서만 작성 가능
     * - 본인 신청에 대해서만 후기 작성 가능
     * - 동일 신청에 대해 여러 후기 작성 가능 (제한 없음)
     *
     * @param userId 입양자 고유 ID (JWT에서 추출)
     * @param createReviewDto 후기 작성 데이터
     * @returns 생성된 후기 정보
     * @throws BadRequestException 잘못된 요청
     */
    async createReview(userId: string, createReviewDto: ReviewCreateRequestDto): Promise<any> {
        return this.createAdopterReviewUseCase.execute(userId, createReviewDto);
    }

    /**
     * 즐겨찾기 브리더 추가
     * 브리더 기본 정보를 캐시하여 빠른 조회 지원
     * 입양자 및 브리더 모두 사용 가능
     *
     * 비즈니스 규칙:
     * - 중복 즐겨찾기 방지
     * - 브리더 기본 정보 스냅샷 저장
     * - 실시간 브리더 정보 반영
     *
     * @param userId 사용자 고유 ID (입양자 또는 브리더)
     * @param addFavoriteDto 즐겨찾기 추가 데이터
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 성공 메시지
     * @throws ConflictException 이미 즐겨찾기된 브리더
     */
    async addFavorite(userId: string, addFavoriteDto: FavoriteAddRequestDto, userRole?: string): Promise<any> {
        return this.addFavoriteBreederUseCase.execute(userId, addFavoriteDto, userRole);
    }

    /**
     * 즐겨찾기 브리더 제거
     * 입양자 및 브리더 모두 사용 가능
     *
     * @param userId 사용자 고유 ID (입양자 또는 브리더)
     * @param breederId 제거할 브리더 ID
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 즐겨찾기
     */
    async removeFavorite(userId: string, breederId: string, userRole?: string): Promise<any> {
        return this.removeFavoriteBreederUseCase.execute(userId, breederId, userRole);
    }

    /**
     * 즐겨찾기 브리더 목록 조회
     * 페이지네이션을 지원하며, 브리더의 최신 정보와 함께 반환
     * 입양자 및 브리더 모두 사용 가능
     *
     * @param userId 사용자 고유 ID (입양자 또는 브리더)
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 항목 수 (기본값: 10)
     * @param userRole 사용자 역할 ('adopter' | 'breeder')
     * @returns 즐겨찾기 브리더 목록과 페이지네이션 정보
     * @throws BadRequestException 존재하지 않는 사용자
     */
    async getFavoriteList(userId: string, page: number = 1, limit: number = 10, userRole?: string): Promise<any> {
        return this.getFavoriteBreedersUseCase.execute(userId, page, limit, userRole);
    }

    /**
     * 브리더 신고 제출
     * 관리자 검토를 위한 신고 내역 생성
     *
     * 비즈니스 규칙:
     * - 신고자 정보 기록 및 추적
     * - 신고 사유 및 상세 내용 필수
     * - 관리자 검토 대기 상태로 초기화
     *
     * @param userId 신고자 (입양자) 고유 ID
     * @param createReportDto 신고 내용 데이터
     * @returns 생성된 신고 ID 및 성공 메시지
     */
    async createReport(userId: string, createReportDto: ReportCreateRequestDto): Promise<any> {
        return this.createAdopterReportUseCase.execute(userId, createReportDto);
    }

    /**
     * 입양자 프로필 정보 조회
     * 즐겨찾기, 입양 신청 내역, 작성한 후기 등 전체 데이터 포함
     *
     * @param userId 입양자 고유 ID
     * @returns 입양자 전체 프로필 정보
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async getProfile(userId: string): Promise<AdopterProfileResponseDto> {
        return this.getAdopterProfileUseCase.execute(userId);
    }

    /**
     * 입양자 프로필 정보 수정
     * 이름, 연락처, 프로필 이미지 등 기본 정보 변경
     *
     * @param userId 입양자 고유 ID
     * @param updateData 수정할 프로필 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async updateProfile(
        userId: string,
        updateData: { name?: string; phone?: string; profileImage?: string },
    ): Promise<any> {
        return this.updateAdopterProfileUseCase.execute(userId, updateData);
    }

    /**
     * 입양자가 작성한 후기 목록 조회 (브리더 상세 정보 포함)
     *
     * 반환 정보:
     * - 브리더 닉네임, 프로필 사진, 레벨, 브리딩 동물 종류
     * - 후기 내용, 후기 종류, 작성 일자
     * - 최신순 정렬, 페이지당 10개
     *
     * @param userId 입양자 고유 ID
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 후기 목록과 페이지네이션 정보
     */
    async getMyReviews(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        return this.getAdopterReviewsUseCase.execute(userId, page, limit);
    }

    /**
     * 후기 세부 조회
     *
     * @param userId 입양자 고유 ID
     * @param reviewId 후기 ID
     * @returns 후기 세부 정보
     */
    async getReviewDetail(userId: string, reviewId: string): Promise<any> {
        return this.getAdopterReviewDetailUseCase.execute(userId, reviewId);
    }

    /**
     * 후기 신고 처리
     *
     * 부적절한 후기를 신고하여 관리자 검토를 요청합니다.
     * 신고된 후기는 isReported 필드가 true로 변경되며,
     * 관리자가 검토 후 공개 여부를 결정합니다.
     *
     * @param userId 신고자 (입양자) 고유 ID
     * @param reviewId 신고할 후기 ID
     * @param reason 신고 사유
     * @param description 신고 상세 설명
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 후기
     */
    async reportReview(userId: string, reviewId: string, reason: string, description?: string): Promise<any> {
        return this.reportAdopterReviewUseCase.execute(userId, {
            reviewId,
            reason,
            description,
        });
    }

    /**
     * 입양자가 제출한 모든 입양 신청 내역을 페이지네이션으로 조회
     *
     * @param userId 입양자 고유 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 아이템 수 (기본값: 10)
     * @param animalType 동물 타입 필터 (선택사항: 'cat' 또는 'dog')
     * @returns 입양 신청 목록과 페이지네이션 정보
     * @throws BadRequestException 존재하지 않는 입양자
     */
    async getMyApplications(
        userId: string,
        page: number = 1,
        limit: number = 10,
        animalType?: 'cat' | 'dog',
    ): Promise<any> {
        return this.getAdopterApplicationsUseCase.execute(userId, page, limit, animalType);
    }

    /**
     * 입양자가 자신이 제출한 특정 입양 신청의 상세 정보 조회
     *
     * @param userId 입양자 고유 ID
     * @param applicationId 신청 ID
     * @returns 신청 상세 정보
     * @throws BadRequestException 존재하지 않는 신청 또는 권한 없음
     */
    async getApplicationDetail(userId: string, applicationId: string): Promise<any> {
        return this.getAdopterApplicationDetailUseCase.execute(userId, applicationId);
    }

    /**
     * [deleteAccount] 입양자 회원 탈퇴
     *
     * 기능:
     * - 입양자 계정을 소프트 삭제 처리
     * - 개인정보 마스킹 처리
     * - 탈퇴 사유 저장 (통계용)
     * - 작성한 후기, 신고 등은 보존 (통계 및 법적 보존 요건)
     *
     * @param userId - 입양자 고유 ID
     * @param deleteData - 탈퇴 사유 정보
     * @returns 탈퇴 처리 결과
     */
    async deleteAccount(userId: string, deleteData: AccountDeleteRequestDto): Promise<AccountDeleteResponseDto> {
        return this.deleteAdopterAccountUseCase.execute(userId, deleteData);
    }
}

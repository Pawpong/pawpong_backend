import { Injectable } from '@nestjs/common';

import { PetStatus } from '../../common/enum/user.enum';

import { ParentPetAddDto } from './dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from './dto/request/parent-pet-update-request.dto';
import { AvailablePetAddDto } from './dto/request/available-pet-add-request.dto';
import { ProfileUpdateRequestDto } from './dto/request/profile-update-request.dto';
import { VerificationSubmitRequestDto } from './dto/request/verification-submit-request.dto';
import { ApplicationStatusUpdateRequestDto } from './dto/request/application-status-update-request.dto';
import { SubmitDocumentsRequestDto } from './dto/request/submit-documents-request.dto';
import { BreederDashboardResponseDto } from '../breeder/dto/response/breeder-dashboard-response.dto';
import { UploadDocumentsResponseDto } from './dto/response/upload-documents-response.dto';
import { GetBreederManagementDashboardUseCase } from './application/use-cases/get-breeder-management-dashboard.use-case';
import { GetBreederManagementProfileUseCase } from './application/use-cases/get-breeder-management-profile.use-case';
import { UpdateBreederManagementProfileUseCase } from './application/use-cases/update-breeder-management-profile.use-case';
import { GetBreederManagementReceivedApplicationsUseCase } from './application/use-cases/get-breeder-management-received-applications.use-case';
import { GetBreederManagementMyPetsUseCase } from './application/use-cases/get-breeder-management-my-pets.use-case';
import { GetBreederManagementMyReviewsUseCase } from './application/use-cases/get-breeder-management-my-reviews.use-case';
import { GetBreederManagementVerificationStatusUseCase } from './application/use-cases/get-breeder-management-verification-status.use-case';
import { SubmitBreederManagementVerificationUseCase } from './application/use-cases/submit-breeder-management-verification.use-case';
import { GetBreederManagementApplicationFormUseCase } from './application/use-cases/get-breeder-management-application-form.use-case';
import { UpdateBreederManagementApplicationFormUseCase } from './application/use-cases/update-breeder-management-application-form.use-case';
import { UpdateBreederManagementSimpleApplicationFormUseCase } from './application/use-cases/update-breeder-management-simple-application-form.use-case';
import { AddBreederManagementParentPetUseCase } from './application/use-cases/add-breeder-management-parent-pet.use-case';
import { UpdateBreederManagementParentPetUseCase } from './application/use-cases/update-breeder-management-parent-pet.use-case';
import { RemoveBreederManagementParentPetUseCase } from './application/use-cases/remove-breeder-management-parent-pet.use-case';
import { AddBreederManagementAvailablePetUseCase } from './application/use-cases/add-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetUseCase } from './application/use-cases/update-breeder-management-available-pet.use-case';
import { UpdateBreederManagementAvailablePetStatusUseCase } from './application/use-cases/update-breeder-management-available-pet-status.use-case';
import { RemoveBreederManagementAvailablePetUseCase } from './application/use-cases/remove-breeder-management-available-pet.use-case';
import { AddBreederManagementReviewReplyUseCase } from './application/use-cases/add-breeder-management-review-reply.use-case';
import { UpdateBreederManagementReviewReplyUseCase } from './application/use-cases/update-breeder-management-review-reply.use-case';
import { RemoveBreederManagementReviewReplyUseCase } from './application/use-cases/remove-breeder-management-review-reply.use-case';
import { GetBreederManagementApplicationDetailUseCase } from './application/use-cases/get-breeder-management-application-detail.use-case';
import { UpdateBreederManagementApplicationStatusUseCase } from './application/use-cases/update-breeder-management-application-status.use-case';
import { DeleteBreederManagementAccountUseCase } from './application/use-cases/delete-breeder-management-account.use-case';
import { UploadBreederManagementVerificationDocumentsUseCase } from './application/use-cases/upload-breeder-management-verification-documents.use-case';
import { SubmitBreederManagementVerificationDocumentsUseCase } from './application/use-cases/submit-breeder-management-verification-documents.use-case';

/**
 * 브리더 관리 비즈니스 로직 처리 Service
 *
 * 역할:
 * - 인증된 브리더 전용 기능 처리 (대시보드, 프로필 관리, 반려동물 등록/관리)
 * - 입양 신청 관리 및 상태 업데이트 (승인, 거절, 상담 처리)
 * - 브리더 인증 신청 및 검증 프로세스 관리
 * - 부모견/부모묘 및 분양 가능 개체 등록/수정/삭제
 * - 통계 데이터 수집 및 대시보드 제공
 *
 * 설계 원칙:
 * - 권한 기반 접근: 인증된 브리더만 접근 가능한 기능들
 * - 비즈니스 로직 검증: 데이터 일관성 및 비즈니스 규칙 준수
 * - 도메인 간 동기화: 입양자와 브리더 데이터 일관성 유지
 * - 실시간 통계: 신청, 승인, 완료 등 실시간 데이터 반영
 */
@Injectable()
export class BreederManagementService {
    constructor(
        private getBreederManagementDashboardUseCase: GetBreederManagementDashboardUseCase,
        private getBreederManagementProfileUseCase: GetBreederManagementProfileUseCase,
        private updateBreederManagementProfileUseCase: UpdateBreederManagementProfileUseCase,
        private getBreederManagementReceivedApplicationsUseCase: GetBreederManagementReceivedApplicationsUseCase,
        private getBreederManagementMyPetsUseCase: GetBreederManagementMyPetsUseCase,
        private getBreederManagementMyReviewsUseCase: GetBreederManagementMyReviewsUseCase,
        private getBreederManagementVerificationStatusUseCase: GetBreederManagementVerificationStatusUseCase,
        private submitBreederManagementVerificationUseCase: SubmitBreederManagementVerificationUseCase,
        private getBreederManagementApplicationFormUseCase: GetBreederManagementApplicationFormUseCase,
        private updateBreederManagementApplicationFormUseCase: UpdateBreederManagementApplicationFormUseCase,
        private updateBreederManagementSimpleApplicationFormUseCase: UpdateBreederManagementSimpleApplicationFormUseCase,
        private addBreederManagementParentPetUseCase: AddBreederManagementParentPetUseCase,
        private updateBreederManagementParentPetUseCase: UpdateBreederManagementParentPetUseCase,
        private removeBreederManagementParentPetUseCase: RemoveBreederManagementParentPetUseCase,
        private addBreederManagementAvailablePetUseCase: AddBreederManagementAvailablePetUseCase,
        private updateBreederManagementAvailablePetUseCase: UpdateBreederManagementAvailablePetUseCase,
        private updateBreederManagementAvailablePetStatusUseCase: UpdateBreederManagementAvailablePetStatusUseCase,
        private removeBreederManagementAvailablePetUseCase: RemoveBreederManagementAvailablePetUseCase,
        private addBreederManagementReviewReplyUseCase: AddBreederManagementReviewReplyUseCase,
        private updateBreederManagementReviewReplyUseCase: UpdateBreederManagementReviewReplyUseCase,
        private removeBreederManagementReviewReplyUseCase: RemoveBreederManagementReviewReplyUseCase,
        private getBreederManagementApplicationDetailUseCase: GetBreederManagementApplicationDetailUseCase,
        private updateBreederManagementApplicationStatusUseCase: UpdateBreederManagementApplicationStatusUseCase,
        private deleteBreederManagementAccountUseCase: DeleteBreederManagementAccountUseCase,
        private uploadBreederManagementVerificationDocumentsUseCase: UploadBreederManagementVerificationDocumentsUseCase,
        private submitBreederManagementVerificationDocumentsUseCase: SubmitBreederManagementVerificationDocumentsUseCase,
    ) {}

    /**
     * 브리더 대시보드 데이터 조회
     * 인증 상태, 통계 정보, 최근 신청 내역 등 종합적인 대시보드 정보 제공
     *
     * @param userId 브리더 고유 ID
     * @returns 대시보드에 필요한 모든 데이터
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getDashboard(userId: string): Promise<BreederDashboardResponseDto> {
        return this.getBreederManagementDashboardUseCase.execute(userId);
    }

    /**
     * 브리더 프로필 정보 업데이트
     * 브리더 소개, 위치, 전문 분야, 경력 등 프로필 정보 수정
     *
     * 비즈니스 규칙:
     * - 프로필 사진 최대 3장 제한
     * - 필수 정보와 선택 정보 구분 처리
     * - MongoDB 중첩 객체 업데이트 최적화
     *
     * @param userId 브리더 고유 ID
     * @param updateData 수정할 프로필 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 유효성 검사 실패 또는 존재하지 않는 브리더
     */
    async updateProfile(userId: string, updateData: ProfileUpdateRequestDto): Promise<any> {
        return this.updateBreederManagementProfileUseCase.execute(userId, updateData);
    }

    /**
     * 부모견/부모묘 등록
     * 브리더의 종견/종묘 정보를 등록하여 분양 개체의 혈통 정보 제공
     *
     * 비즈니스 규칙:
     * - 부모견당 사진 1장 제한
     * - 건강 정보 필수 입력
     * - 나이는 월 단위를 년 단위로 변환
     * - 고유 ID 자동 생성
     *
     * @param userId 브리더 고유 ID
     * @param parentPetDto 부모견 등록 데이터
     * @returns 생성된 부모견 ID 및 성공 메시지
     * @throws BadRequestException 유효성 검사 실패 또는 존재하지 않는 브리더
     */
    async addParentPet(userId: string, parentPetDto: ParentPetAddDto): Promise<any> {
        return this.addBreederManagementParentPetUseCase.execute(userId, parentPetDto);
    }

    /**
     * 부모견/부모묘 정보 수정
     *
     * @param userId 브리더 고유 ID
     * @param petId 수정할 부모견 ID
     * @param updateData 수정할 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 부모견
     */
    async updateParentPet(userId: string, petId: string, updateData: ParentPetUpdateDto): Promise<any> {
        return this.updateBreederManagementParentPetUseCase.execute(userId, petId, updateData);
    }

    /**
     * 부모견/부모묘 삭제
     *
     * @param userId 브리더 고유 ID
     * @param petId 삭제할 부모견 ID
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 부모견
     */
    async removeParentPet(userId: string, petId: string): Promise<any> {
        return this.removeBreederManagementParentPetUseCase.execute(userId, petId);
    }

    /**
     * 분양 가능한 반려동물 등록
     * 입양자들이 신청할 수 있는 분양 개체 등록
     *
     * 비즈니스 규칙:
     * - 분양 개체당 사진 1장 제한
     * - 출생일, 가격, 건강 정보 필수
     * - 등록 즉시 분양 가능 상태로 설정
     * - 고유 ID 자동 생성
     *
     * @param userId 브리더 고유 ID
     * @param availablePetDto 분양 개체 등록 데이터
     * @returns 생성된 반려동물 ID 및 성공 메시지
     * @throws BadRequestException 유효성 검사 실패 또는 존재하지 않는 브리더
     */
    async addAvailablePet(userId: string, availablePetDto: AvailablePetAddDto): Promise<any> {
        return this.addBreederManagementAvailablePetUseCase.execute(userId, availablePetDto);
    }

    /**
     * 분양 가능한 반려동물 정보 수정
     *
     * @param userId 브리더 고유 ID
     * @param petId 수정할 반려동물 ID
     * @param updateData 수정할 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 반려동물
     */
    async updateAvailablePet(userId: string, petId: string, updateData: Partial<AvailablePetAddDto>): Promise<any> {
        return this.updateBreederManagementAvailablePetUseCase.execute(userId, petId, updateData);
    }

    /**
     * 분양 개체 상태 업데이트
     * 분양 가능, 예약됨, 분양 완료 등의 상태 변경 처리
     *
     * 비즈니스 규칙:
     * - 분양 완료 시 완료 시각 기록
     * - 예약 시 예약 시각 기록
     * - 상태별 추가 데이터 자동 설정
     *
     * @param userId 브리더 고유 ID
     * @param petId 상태를 변경할 반려동물 ID
     * @param status 변경할 상태
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 반려동물
     */
    async updatePetStatus(userId: string, petId: string, status: PetStatus): Promise<any> {
        return this.updateBreederManagementAvailablePetStatusUseCase.execute(userId, petId, status);
    }

    /**
     * 분양 가능한 반려동물 삭제
     *
     * @param userId 브리더 고유 ID
     * @param petId 삭제할 반려동물 ID
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 반려동물
     */
    async removeAvailablePet(userId: string, petId: string): Promise<any> {
        return this.removeBreederManagementAvailablePetUseCase.execute(userId, petId);
    }

    /**
     * 받은 입양 신청 목록 조회 (페이지네이션)
     *
     * @param userId 브리더 고유 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 항목 수 (기본값: 10)
     * @returns 페이지네이션된 입양 신청 목록
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getReceivedApplications(userId: string, page: number = 1, limit: number = 10): Promise<any> {
        return this.getBreederManagementReceivedApplicationsUseCase.execute(userId, page, limit);
    }

    /**
     * 받은 입양 신청 상세 조회
     * 브리더가 받은 특정 입양 신청의 상세 정보 조회
     *
     * @param userId 브리더 고유 ID
     * @param applicationId 신청 ID
     * @returns 신청 상세 정보
     * @throws BadRequestException 존재하지 않는 신청 또는 권한 없음
     */
    async getApplicationDetail(userId: string, applicationId: string): Promise<any> {
        return this.getBreederManagementApplicationDetailUseCase.execute(userId, applicationId);
    }

    /**
     * 입양 신청 상태 업데이트
     * 브리더가 받은 입양 신청에 대한 승인, 거절, 상담 처리
     *
     * 비즈니스 규칙:
     * - 양방향 데이터 동기화 (브리더 ↔ 입양자)
     * - 승인 완료 시 통계 업데이트
     * - 처리 메모 선택 사항
     * - 상태 변경 이력 추적
     *
     * @param userId 브리더 고유 ID
     * @param applicationId 처리할 입양 신청 ID
     * @param updateData 상태 및 처리 내용
     * @returns 성공 메시지
     * @throws BadRequestException 존재하지 않는 브리더 또는 신청
     */
    async updateApplicationStatus(
        userId: string,
        applicationId: string,
        updateData: ApplicationStatusUpdateRequestDto,
    ): Promise<any> {
        return this.updateBreederManagementApplicationStatusUseCase.execute(userId, applicationId, updateData);
    }

    /**
     * 브리더 인증 신청 제출
     * 관리자 검토를 위한 브리더 인증 서류 및 정보 제출
     *
     * 비즈니스 규칙:
     * - 이미 인증된 브리더는 재신청 불가
     * - 인증 서류 첨부 필수
     * - 제출 즉시 검토 중 상태로 변경
     * - 이메일 연락처 필수
     *
     * @param userId 브리더 고유 ID
     * @param verificationData 인증 신청 데이터
     * @returns 성공 메시지
     * @throws BadRequestException 이미 인증된 브리더 또는 존재하지 않는 브리더
     */
    async submitVerification(userId: string, verificationData: VerificationSubmitRequestDto): Promise<any> {
        return this.submitBreederManagementVerificationUseCase.execute(userId, verificationData);
    }

    /**
     * 브리더 인증 서류 업로드
     * 인증된 브리더가 인증 서류를 업로드
     *
     * @param userId 브리더 고유 ID
     * @param files 업로드할 파일들
     * @param types 파일 타입 배열
     * @param level 브리더 레벨
     * @returns 업로드 결과
     */
    async uploadVerificationDocuments(
        userId: string,
        files: Express.Multer.File[],
        types: string[],
        level: 'new' | 'elite',
    ): Promise<UploadDocumentsResponseDto> {
        return this.uploadBreederManagementVerificationDocumentsUseCase.execute(userId, files, types, level);
    }

    /**
     * 브리더 인증 서류 제출 (간소화된 버전)
     * 업로드된 서류를 제출하여 인증 신청
     *
     * @param userId 브리더 고유 ID
     * @param dto 제출 데이터
     * @returns 성공 메시지
     */
    async submitVerificationDocuments(userId: string, dto: SubmitDocumentsRequestDto): Promise<any> {
        return this.submitBreederManagementVerificationDocumentsUseCase.execute(userId, dto);
    }

    /**
     * 브리더 인증 상태 조회
     * 인증된 브리더가 자신의 인증 상태와 관련 정보를 확인
     *
     * 반환 정보:
     * - 인증 상태 (pending, reviewing, approved, rejected)
     * - 구독 플랜 및 브리더 레벨
     * - 제출/검토 일시
     * - 인증 문서 URL (Signed URL, 1시간 유효)
     * - 거절 사유 (거절된 경우)
     *
     * @param userId 브리더 고유 ID
     * @returns 인증 상태 정보
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getVerificationStatus(userId: string): Promise<any> {
        return this.getBreederManagementVerificationStatusUseCase.execute(userId);
    }

    /**
     * 브리더 전체 프로필 정보 조회
     * 브리더 관리 페이지에서 사용할 모든 정보 제공
     *
     * 포함 정보:
     * - 기본 정보 (이름, 이메일, 연락처 등)
     * - 인증 상태 및 프로필 정보
     * - 활성화된 부모견/분양 개체 목록
     * - 공개 가능한 후기 및 통계
     * - 신고 내역 (관리 목적)
     *
     * @param userId 브리더 고유 ID
     * @returns 브리더 전체 프로필 정보
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getBreederProfile(userId: string): Promise<any> {
        return this.getBreederManagementProfileUseCase.execute(userId);
    }

    /**
     * 브리더 자신의 개체 목록 조회 (관리용)
     * 모든 상태의 개체를 포함하며, 비활성화된 개체도 조회 가능
     *
     * @param userId 브리더 고유 ID
     * @param status 상태 필터 (선택사항)
     * @param includeInactive 비활성화된 개체 포함 여부
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 개체 목록과 통계
     */
    async getMyPets(
        userId: string,
        status?: string,
        includeInactive: boolean = false,
        page: number = 1,
        limit: number = 20,
    ): Promise<any> {
        return this.getBreederManagementMyPetsUseCase.execute(userId, status, includeInactive, page, limit);
    }

    /**
     * 브리더 자신에게 달린 후기 목록 조회 (관리용)
     * 공개/비공개 후기 모두 조회 가능
     *
     * @param userId 브리더 고유 ID
     * @param visibility 공개 여부 필터 (all, visible, hidden)
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 후기 목록과 통계
     */
    async getMyReviews(userId: string, visibility: string = 'all', page: number = 1, limit: number = 10): Promise<any> {
        return this.getBreederManagementMyReviewsUseCase.execute(userId, visibility, page, limit);
    }

    /**
     * 표준 입양 신청 폼 질문 17개 (Figma 디자인 기반 - 수정 불가)
     *
     * 모든 브리더에게 자동으로 포함되는 필수 질문들입니다.
     */
    /**
     * 입양 신청 폼 조회 (표준 + 커스텀 질문)
     *
     * 브리더가 설정한 전체 폼 구조를 조회합니다.
     * 표준 17개 질문은 자동으로 포함되며, 브리더가 추가한 커스텀 질문도 함께 반환합니다.
     *
     * @param breederId 브리더 ID
     * @returns 전체 폼 구조 (표준 + 커스텀 질문)
     */
    async getApplicationForm(breederId: string): Promise<any> {
        return this.getBreederManagementApplicationFormUseCase.execute(breederId);
    }

    /**
     * 입양 신청 폼 수정 (커스텀 질문만)
     *
     * 브리더가 커스텀 질문을 추가/수정/삭제합니다.
     * 표준 17개 질문은 수정할 수 없습니다.
     *
     * @param breederId 브리더 ID
     * @param updateDto 커스텀 질문 목록
     * @returns 성공 메시지
     */
    async updateApplicationForm(breederId: string, updateDto: any): Promise<any> {
        return this.updateBreederManagementApplicationFormUseCase.execute(breederId, updateDto);
    }

    /**
     * 입양 신청 폼 업데이트 (간소화 버전)
     * 질문 텍스트만 받아서 자동으로 기본값 설정
     *
     * 자동 설정값:
     * - id: `custom_${timestamp}_${index}`
     * - type: 'textarea' (고정)
     * - required: false (선택)
     * - order: 배열 순서 (1부터 시작)
     *
     * 검증 규칙:
     * - 빈 질문 자동 제거 (공백만 있는 질문)
     * - 최대 5개 제한
     * - 질문당 최소 2자, 최대 200자
     * - 중복 질문 체크 (대소문자 구분 없음)
     *
     * @param breederId 브리더 고유 ID
     * @param questions 질문 텍스트 배열
     * @returns 업데이트 결과 (message, customQuestions, totalQuestions)
     * @throws BadRequestException 브리더를 찾을 수 없거나 유효성 검증 실패
     */
    async updateApplicationFormSimple(breederId: string, questions: Array<{ question: string }>): Promise<any> {
        return this.updateBreederManagementSimpleApplicationFormUseCase.execute(breederId, questions);
    }

    /**
     * 브리더 계정 탈퇴 (소프트 딜리트)
     * 계정 상태를 'deleted'로 변경하여 로그인 불가 처리하고 탈퇴 사유 저장
     *
     * @param userId 브리더 고유 ID
     * @param deleteData 탈퇴 사유 정보
     * @returns 탈퇴 정보
     * @throws BadRequestException 존재하지 않는 브리더 또는 이미 탈퇴된 계정
     */
    async deleteBreederAccount(
        userId: string,
        deleteData?: { reason?: string; otherReason?: string },
    ): Promise<{ breederId: string; deletedAt: string; message: string }> {
        return this.deleteBreederManagementAccountUseCase.execute(userId, deleteData);
    }

    /**
     * 후기 답글 등록
     * 브리더가 자신에게 달린 후기에 답글을 작성합니다.
     */
    async addReviewReply(breederId: string, reviewId: string, content: string): Promise<any> {
        return this.addBreederManagementReviewReplyUseCase.execute(breederId, reviewId, content);
    }

    /**
     * 후기 답글 수정
     * 브리더가 자신이 작성한 답글을 수정합니다.
     */
    async updateReviewReply(breederId: string, reviewId: string, content: string): Promise<any> {
        return this.updateBreederManagementReviewReplyUseCase.execute(breederId, reviewId, content);
    }

    /**
     * 후기 답글 삭제
     * 브리더가 자신이 작성한 답글을 삭제합니다.
     */
    async deleteReviewReply(breederId: string, reviewId: string): Promise<any> {
        return this.removeBreederManagementReviewReplyUseCase.execute(breederId, reviewId);
    }
}

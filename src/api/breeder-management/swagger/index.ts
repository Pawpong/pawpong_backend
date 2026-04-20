import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../common/decorator/swagger.decorator';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../constants/breeder-management-response-messages';
import {
    BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE,
    BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE,
} from '../constants/breeder-management-swagger.constants';
import { BreederDashboardResponseDto } from '../../breeder/dto/response/breeder-dashboard-response.dto';
import { BreederProfileResponseDto } from '../../breeder/dto/response/breeder-profile-response.dto';
import { ReceivedApplicationListResponseDto } from '../../breeder/dto/response/received-application-list-response.dto';
import { ApplicationFormUpdateRequestDto } from '../dto/request/application-form-update-request.dto';
import { ApplicationStatusUpdateRequestDto } from '../dto/request/application-status-update-request.dto';
import { AvailablePetAddDto } from '../dto/request/available-pet-add-request.dto';
import { BreederAccountDeleteRequestDto } from '../dto/request/breeder-account-delete-request.dto';
import { ParentPetAddDto } from '../dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from '../dto/request/parent-pet-update-request.dto';
import { PetStatusUpdateRequestDto } from '../dto/request/pet-status-update-request.dto';
import { ProfileUpdateRequestDto } from '../dto/request/profile-update-request.dto';
import { ReviewReplyRequestDto } from '../dto/request/review-reply-request.dto';
import { SimpleApplicationFormUpdateRequestDto } from '../dto/request/simple-application-form-update-request.dto';
import { SubmitDocumentsRequestDto } from '../dto/request/submit-documents-request.dto';
import { UploadDocumentsRequestDto } from '../dto/request/upload-documents-request.dto';
import { VerificationSubmitRequestDto } from '../dto/request/verification-submit-request.dto';
import { ApplicationFormResponseDto } from '../dto/response/application-form-response.dto';
import { BreederManagementApplicationDetailResponseDto } from '../dto/response/application-detail-response.dto';
import {
    ApplicationFormUpdateResponseDto,
    SimpleApplicationFormUpdateResponseDto,
} from '../dto/response/application-form-update-response.dto';
import { ApplicationStatusUpdateResponseDto } from '../dto/response/application-status-update-response.dto';
import { BreederAccountDeleteResponseDto } from '../dto/response/breeder-account-delete-response.dto';
import { MyPetItemDto, MyPetsListResponseDto } from '../dto/response/my-pets-list-response.dto';
import { MyReviewItemDto, MyReviewsListResponseDto } from '../dto/response/my-reviews-list-response.dto';
import { PetAddResponseDto } from '../dto/response/pet-add-response.dto';
import { PetRemoveResponseDto } from '../dto/response/pet-remove-response.dto';
import { PetStatusUpdateResponseDto } from '../dto/response/pet-status-update-response.dto';
import { PetUpdateResponseDto } from '../dto/response/pet-update-response.dto';
import { BreederProfileUpdateResponseDto } from '../dto/response/profile-update-response.dto';
import { ReviewReplyDeleteResponseDto, ReviewReplyResponseDto } from '../dto/response/review-reply-response.dto';
import { UploadDocumentsResponseDto } from '../dto/response/upload-documents-response.dto';
import { VerificationStatusResponseDto } from '../dto/response/verification-status-response.dto';
import { VerificationSubmitResponseDto } from '../dto/response/verification-submit-response.dto';

export function ApiBreederManagementController() {
    return ApiController('브리더 관리');
}

export function ApiUploadBreederManagementVerificationDocumentsEndpoint() {
    return applyDecorators(
        ApiConsumes('multipart/form-data'),
        ApiEndpoint({
            summary: '브리더 인증 서류 업로드',
            description: `브리더 입점 인증 서류를 업로드합니다.

**New 레벨 (필수 2개):**
- idCard: 신분증 사본
- businessLicense: 동물생산업 등록증

**Elite 레벨 (필수 4개):**
- idCard: 신분증 사본
- businessLicense: 동물생산업 등록증
- contractSample: 표준 입양계약서 샘플
- breederCertificate: 브리더 인증 서류 (강아지: breederDogCertificate, 고양이: breederCatCertificate)

**요청 형식:**
- files: 파일 배열
- types: 서류 타입 JSON 배열 (예: ["idCard","businessLicense"])
- level: 브리더 레벨 ("new" 또는 "elite")

**응답:**
- fileName: 파일 경로 (서류 제출 시 사용)
- url: 미리보기용 Signed URL (1시간 유효)`,
            responseType: UploadDocumentsResponseDto,
            successDescription: '브리더 인증 서류 업로드 성공',
            successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsUploaded,
            errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
        }),
        ApiBody({
            type: UploadDocumentsRequestDto,
            schema: {
                type: 'object',
                properties: {
                    files: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'binary',
                        },
                    },
                    types: {
                        type: 'string',
                        example: '["idCard","businessLicense"]',
                    },
                    level: {
                        type: 'string',
                        enum: ['new', 'elite'],
                        example: 'new',
                    },
                },
                required: ['files', 'types', 'level'],
            },
        }),
    );
}

export const BreederManagementSwaggerDocs = {
    dashboard: {
        summary: '브리더 대시보드 조회',
        description: '브리더의 통계 정보와 최근 활동을 확인합니다.',
        responseType: BreederDashboardResponseDto,
        successDescription: '브리더 대시보드 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.dashboardRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    profile: {
        summary: '브리더 프로필 조회',
        description: '로그인한 브리더의 프로필 정보를 조회합니다.',
        responseType: BreederProfileResponseDto,
        successDescription: '브리더 프로필 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateProfile: {
        summary: '브리더 프로필 수정',
        description: '브리더의 프로필 정보를 업데이트합니다.',
        responseType: BreederProfileUpdateResponseDto,
        successDescription: '브리더 프로필 수정 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.profileUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    verificationStatus: {
        summary: '브리더 인증 상태 조회',
        description:
            '로그인한 브리더의 인증 상태 및 관련 정보를 조회합니다. 인증 문서 URL은 1시간 유효한 Signed URL로 제공됩니다.',
        responseType: VerificationStatusResponseDto,
        successDescription: '브리더 인증 상태 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationStatusRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    submitVerification: {
        summary: '브리더 인증 신청',
        description: '브리더 인증을 위한 서류를 제출합니다.',
        responseType: VerificationSubmitResponseDto,
        successDescription: '브리더 인증 신청 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationSubmitted,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    submitVerificationDocuments: {
        summary: '브리더 인증 서류 제출 (간소화)',
        description: `업로드된 서류를 제출하여 인증 신청합니다.

**프론트엔드 플로우:**
1. POST /verification/upload로 파일 업로드 → fileName 획득
2. 이 엔드포인트로 fileName들을 제출

**요청 형식:**
- level: 브리더 레벨 ("new" 또는 "elite")
- documents: 서류 목록 [{ type, fileName }]`,
        responseType: VerificationSubmitResponseDto,
        successDescription: '브리더 인증 서류 제출 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.verificationDocumentsSubmitted,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    addParentPet: {
        summary: '부모견/부모묘 추가',
        description: '새로운 부모 반려동물을 등록합니다.',
        responseType: PetAddResponseDto,
        successDescription: '부모 반려동물 추가 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetAdded,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateParentPet: {
        summary: '부모견/부모묘 정보 수정',
        description: '등록된 부모 반려동물의 정보를 수정합니다.',
        responseType: PetUpdateResponseDto,
        successDescription: '부모 반려동물 수정 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    removeParentPet: {
        summary: '부모견/부모묘 삭제',
        description: '등록된 부모 반려동물을 삭제합니다.',
        responseType: PetRemoveResponseDto,
        successDescription: '부모 반려동물 삭제 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.parentPetRemoved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    addAvailablePet: {
        summary: '분양 가능한 반려동물 추가',
        description: '새로운 분양 가능한 반려동물을 등록합니다.',
        responseType: PetAddResponseDto,
        successDescription: '분양 반려동물 추가 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetAdded,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateAvailablePet: {
        summary: '분양 가능한 반려동물 정보 수정',
        description: '등록된 분양 반려동물의 정보를 수정합니다.',
        responseType: PetUpdateResponseDto,
        successDescription: '분양 반려동물 수정 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updatePetStatus: {
        summary: '반려동물 상태 변경',
        description: '분양 반려동물의 상태를 변경합니다.',
        responseType: PetStatusUpdateResponseDto,
        successDescription: '반려동물 상태 변경 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.petStatusUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    removeAvailablePet: {
        summary: '분양 가능한 반려동물 삭제',
        description: '등록된 분양 반려동물을 삭제합니다.',
        responseType: PetRemoveResponseDto,
        successDescription: '분양 반려동물 삭제 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.availablePetRemoved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    receivedApplications: {
        summary: '받은 입양 신청 목록 조회',
        description: '브리더가 받은 입양 신청들을 페이지네이션으로 조회합니다.',
        responseType: ReceivedApplicationListResponseDto,
        successDescription: '받은 입양 신청 목록 조회 성공',
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    applicationDetail: {
        summary: '받은 입양 신청 상세 조회',
        description: `브리더가 받은 특정 입양 신청의 상세 정보를 조회합니다.

**응답 데이터:**
- 신청 ID, 입양자 정보 (이름, 이메일, 연락처)
- 반려동물 정보 (있는 경우)
- 신청서 전체 내용 (8가지 필수 정보 포함)
- 신청 상태, 신청 일시, 처리 일시
- 브리더 메모

**권한:**
- 본인이 받은 신청만 조회 가능`,
        responseType: BreederManagementApplicationDetailResponseDto,
        successDescription: '입양 신청 상세 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationDetailRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateApplicationStatus: {
        summary: '입양 신청 상태 업데이트',
        description: '받은 입양 신청의 상태를 변경합니다.',
        responseType: ApplicationStatusUpdateResponseDto,
        successDescription: '입양 신청 상태 업데이트 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationStatusUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    myPets: {
        summary: '내 개체 목록 조회',
        description:
            '브리더 자신의 모든 개체 목록을 관리 목적으로 조회합니다. 비활성화된 개체, 상태별 필터링, 입양 신청 수 등 상세 정보가 포함됩니다.',
        responseType: MyPetsListResponseDto,
        itemType: MyPetItemDto,
        successDescription: '내 개체 목록 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.myPetsRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    myReviews: {
        summary: '내게 달린 후기 목록 조회',
        description:
            '브리더 자신에게 작성된 모든 후기를 관리 목적으로 조회합니다. 공개/비공개 후기 모두 확인 가능하며, 신고된 후기 정보도 포함됩니다.',
        responseType: MyReviewsListResponseDto,
        itemType: MyReviewItemDto,
        successDescription: '내게 달린 후기 목록 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.myReviewsRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    applicationForm: {
        summary: '입양 신청 폼 조회',
        description: `브리더가 설정한 입양 신청 폼 전체 구조를 조회합니다.

**응답 데이터:**
- **표준 질문** (13개): 모든 브리더 공통, 수정 불가능
- **커스텀 질문**: 브리더가 추가한 질문들

**표준 질문 목록:**
1. 개인정보 수집 동의
2. 자기소개
3. 가족 구성원 정보
4. 가족 입양 동의
5. 알러지 검사
6. 집 비우는 시간
7. 거주 공간 소개
8. 반려동물 경험
9. 기본 케어 책임
10. 치료비 감당
11. 선호하는 아이
12. 입양 시기
13. 추가 문의사항

**커스텀 질문:**
- 브리더가 자유롭게 추가/삭제 가능`,
        responseType: ApplicationFormResponseDto,
        successDescription: '입양 신청 폼 조회 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormRetrieved,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateApplicationForm: {
        summary: '입양 신청 폼 수정',
        description: `브리더가 커스텀 질문을 추가/수정/삭제합니다.

**중요 사항:**
- 표준 13개 질문은 자동으로 포함되며 수정 불가능
- 이 API는 커스텀 질문만 관리합니다
- 전체 커스텀 질문 배열을 전송 (부분 수정 불가)

**Validation 규칙:**
- 질문 ID는 영문, 숫자, 언더스코어만 사용
- 질문 ID는 중복 불가
- 표준 질문 ID와 중복 불가
- select/radio/checkbox 타입은 options 필수`,
        responseType: ApplicationFormUpdateResponseDto,
        successDescription: '입양 신청 폼 수정 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateApplicationFormSimple: {
        summary: '입양 신청 폼 수정 (간소화 버전)',
        description: `브리더가 커스텀 질문을 간단하게 추가/수정합니다.

**특징:**
- 질문 텍스트만 입력하면 됩니다
- 자동으로 기본값 설정:
  - type: 'textarea' (장문형 고정)
  - required: false (선택 항목)
  - id: 자동 생성 (custom_timestamp_index)
  - order: 배열 순서대로 자동 설정

**사용 케이스:**
- 프론트엔드에서 질문 텍스트만 입력받는 경우
- 빠른 질문 추가가 필요한 경우

**제한사항:**
- 모든 질문이 textarea 타입으로만 생성됨
- 라디오, 체크박스, 선택형 등 다른 타입 사용 불가
- 필수 항목 설정 불가 (모두 선택 항목)`,
        responseType: SimpleApplicationFormUpdateResponseDto,
        successDescription: '입양 신청 폼 수정 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.applicationFormUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    deleteAccount: {
        summary: '브리더 계정 탈퇴',
        description: `브리더 계정을 탈퇴합니다 (소프트 딜리트).

**처리 내용:**
- 계정 상태를 'deleted'로 변경
- 탈퇴 사유 및 상세 사유 저장
- 로그인 불가 처리
- 프로필 정보는 유지 (관리자 확인용)
- 탈퇴 일시 기록

**탈퇴 사유:**
- no_inquiry: 입양 문의가 잘 오지 않았어요
- time_consuming: 운영이 생각보다 번거롭거나 시간이 부족해요
- verification_difficult: 브리더 심사나 검증 절차가 어려웠어요
- policy_mismatch: 수익 구조나 서비스 정책이 잘 맞지 않아요
- uncomfortable_ui: 사용하기 불편했어요 (UI/기능 등)
- other: 다른 이유로 탈퇴하고 싶어요 (otherReason 필수)

**주의사항:**
- 탈퇴 후에는 계정 복구 불가능
- 진행 중인 입양 신청이 있는 경우 먼저 처리 필요`,
        responseType: BreederAccountDeleteResponseDto,
        successDescription: '브리더 계정 탈퇴 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.accountDeleted,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    addReviewReply: {
        summary: '후기 답글 등록',
        description: `브리더가 자신에게 달린 후기에 답글을 작성합니다.

**제한사항:**
- 자신에게 달린 후기에만 답글 작성 가능
- 후기당 1개의 답글만 작성 가능
- 답글 내용은 최대 800자`,
        responseType: ReviewReplyResponseDto,
        successDescription: '후기 답글 등록 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyAdded,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateReviewReply: {
        summary: '후기 답글 수정',
        description: `브리더가 자신이 작성한 답글을 수정합니다.

**제한사항:**
- 자신이 작성한 답글만 수정 가능
- 답글 내용은 최대 800자`,
        responseType: ReviewReplyResponseDto,
        successDescription: '후기 답글 수정 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyUpdated,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    deleteReviewReply: {
        summary: '후기 답글 삭제',
        description: `브리더가 자신이 작성한 답글을 삭제합니다.

**제한사항:**
- 자신이 작성한 답글만 삭제 가능`,
        responseType: ReviewReplyDeleteResponseDto,
        successDescription: '후기 답글 삭제 성공',
        successMessageExample: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
} as const;

export const BreederManagementRequestBodyDtos = {
    profileUpdate: ProfileUpdateRequestDto,
    verificationSubmit: VerificationSubmitRequestDto,
    submitDocuments: SubmitDocumentsRequestDto,
    parentPetAdd: ParentPetAddDto,
    parentPetUpdate: ParentPetUpdateDto,
    availablePetAdd: AvailablePetAddDto,
    petStatusUpdate: PetStatusUpdateRequestDto,
    applicationFormUpdate: ApplicationFormUpdateRequestDto,
    simpleApplicationFormUpdate: SimpleApplicationFormUpdateRequestDto,
    applicationStatusUpdate: ApplicationStatusUpdateRequestDto,
    breederAccountDelete: BreederAccountDeleteRequestDto,
    reviewReply: ReviewReplyRequestDto,
};

function ApiBreederManagementPetIdParam() {
    return ApiParam({
        name: 'petId',
        description: '관리할 반려동물 ID',
        example: '507f1f77bcf86cd799439011',
    });
}

function ApiBreederManagementApplicationIdParam() {
    return ApiParam({
        name: 'applicationId',
        description: '조회 또는 변경할 입양 신청 ID',
        example: '507f1f77bcf86cd799439011',
    });
}

function ApiBreederManagementReviewIdParam() {
    return ApiParam({
        name: 'reviewId',
        description: '답글을 관리할 후기 ID',
        example: '507f1f77bcf86cd799439011',
    });
}

export function ApiUpdateBreederManagementProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateProfile),
        ApiBody({ type: ProfileUpdateRequestDto }),
    );
}

export function ApiSubmitBreederManagementVerificationEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.submitVerification),
        ApiBody({ type: VerificationSubmitRequestDto }),
    );
}

export function ApiSubmitBreederManagementVerificationDocumentsEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.submitVerificationDocuments),
        ApiBody({ type: SubmitDocumentsRequestDto }),
    );
}

export function ApiAddBreederManagementParentPetEndpoint() {
    return applyDecorators(ApiEndpoint(BreederManagementSwaggerDocs.addParentPet), ApiBody({ type: ParentPetAddDto }));
}

export function ApiUpdateBreederManagementParentPetEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateParentPet),
        ApiBreederManagementPetIdParam(),
        ApiBody({ type: ParentPetUpdateDto }),
    );
}

export function ApiRemoveBreederManagementParentPetEndpoint() {
    return applyDecorators(ApiEndpoint(BreederManagementSwaggerDocs.removeParentPet), ApiBreederManagementPetIdParam());
}

export function ApiAddBreederManagementAvailablePetEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.addAvailablePet),
        ApiBody({ type: AvailablePetAddDto }),
    );
}

export function ApiUpdateBreederManagementAvailablePetEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateAvailablePet),
        ApiBreederManagementPetIdParam(),
        ApiBody({ type: AvailablePetAddDto }),
    );
}

export function ApiUpdateBreederManagementPetStatusEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updatePetStatus),
        ApiBreederManagementPetIdParam(),
        ApiBody({ type: PetStatusUpdateRequestDto }),
    );
}

export function ApiRemoveBreederManagementAvailablePetEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.removeAvailablePet),
        ApiBreederManagementPetIdParam(),
    );
}

export function ApiGetBreederManagementReceivedApplicationsEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.receivedApplications),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수', example: 10 }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: ['consultation_pending', 'consultation_completed', 'adoption_approved', 'adoption_rejected'],
            description: '입양 신청 상태 필터',
            example: 'consultation_pending',
        }),
        ApiQuery({
            name: 'petType',
            required: false,
            enum: ['dog', 'cat'],
            description: '반려동물 종류 필터',
            example: 'dog',
        }),
        ApiQuery({
            name: 'recentDays',
            required: false,
            type: Number,
            description: '최근 N일 이내 신청만 조회',
            example: 30,
        }),
    );
}

export function ApiGetBreederManagementApplicationDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.applicationDetail),
        ApiBreederManagementApplicationIdParam(),
    );
}

export function ApiUpdateBreederManagementApplicationStatusEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationStatus),
        ApiBreederManagementApplicationIdParam(),
        ApiBody({ type: ApplicationStatusUpdateRequestDto }),
    );
}

export function ApiGetBreederManagementMyPetsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint(BreederManagementSwaggerDocs.myPets),
        ApiQuery({
            name: 'status',
            required: false,
            type: String,
            description: '개체 상태 필터',
            example: 'available',
        }),
        ApiQuery({
            name: 'includeInactive',
            required: false,
            type: Boolean,
            description: '비활성 개체 포함 여부',
            example: false,
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수', example: 20 }),
    );
}

export function ApiGetBreederManagementMyReviewsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint(BreederManagementSwaggerDocs.myReviews),
        ApiQuery({
            name: 'visibility',
            required: false,
            type: String,
            description: '후기 공개 상태 필터',
            example: 'public',
        }),
        ApiQuery({ name: 'page', required: false, type: Number, description: '페이지 번호', example: 1 }),
        ApiQuery({ name: 'limit', required: false, type: Number, description: '페이지당 항목 수', example: 10 }),
    );
}

export function ApiUpdateBreederManagementApplicationFormEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationForm),
        ApiBody({ type: ApplicationFormUpdateRequestDto }),
    );
}

export function ApiUpdateBreederManagementApplicationFormSimpleEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateApplicationFormSimple),
        ApiBody({ type: SimpleApplicationFormUpdateRequestDto }),
    );
}

export function ApiDeleteBreederManagementAccountEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.deleteAccount),
        ApiBody({ type: BreederAccountDeleteRequestDto }),
    );
}

export function ApiAddBreederManagementReviewReplyEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.addReviewReply),
        ApiBreederManagementReviewIdParam(),
        ApiBody({ type: ReviewReplyRequestDto }),
    );
}

export function ApiUpdateBreederManagementReviewReplyEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.updateReviewReply),
        ApiBreederManagementReviewIdParam(),
        ApiBody({ type: ReviewReplyRequestDto }),
    );
}

export function ApiDeleteBreederManagementReviewReplyEndpoint() {
    return applyDecorators(
        ApiEndpoint(BreederManagementSwaggerDocs.deleteReviewReply),
        ApiBreederManagementReviewIdParam(),
    );
}

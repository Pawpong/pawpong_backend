import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

import { ApiController, ApiEndpoint } from '../../../common/decorator/swagger.decorator';
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

const BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE = {
    status: 400,
    description: '잘못된 요청',
    errorExample: '요청값이 올바르지 않습니다.',
};

const BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE = {
    status: 403,
    description: '권한 없음',
    errorExample: '브리더 권한이 필요합니다.',
};

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
            successMessageExample: '브리더 인증 서류가 업로드되었습니다.',
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
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    profile: {
        summary: '브리더 프로필 조회',
        description: '로그인한 브리더의 프로필 정보를 조회합니다.',
        responseType: BreederProfileResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateProfile: {
        summary: '브리더 프로필 수정',
        description: '브리더의 프로필 정보를 업데이트합니다.',
        responseType: BreederProfileUpdateResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    verificationStatus: {
        summary: '브리더 인증 상태 조회',
        description:
            '로그인한 브리더의 인증 상태 및 관련 정보를 조회합니다. 인증 문서 URL은 1시간 유효한 Signed URL로 제공됩니다.',
        responseType: VerificationStatusResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    submitVerification: {
        summary: '브리더 인증 신청',
        description: '브리더 인증을 위한 서류를 제출합니다.',
        responseType: VerificationSubmitResponseDto,
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
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    addParentPet: {
        summary: '부모견/부모묘 추가',
        description: '새로운 부모 반려동물을 등록합니다.',
        responseType: PetAddResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateParentPet: {
        summary: '부모견/부모묘 정보 수정',
        description: '등록된 부모 반려동물의 정보를 수정합니다.',
        responseType: PetUpdateResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    removeParentPet: {
        summary: '부모견/부모묘 삭제',
        description: '등록된 부모 반려동물을 삭제합니다.',
        responseType: PetRemoveResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    addAvailablePet: {
        summary: '분양 가능한 반려동물 추가',
        description: '새로운 분양 가능한 반려동물을 등록합니다.',
        responseType: PetAddResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateAvailablePet: {
        summary: '분양 가능한 반려동물 정보 수정',
        description: '등록된 분양 반려동물의 정보를 수정합니다.',
        responseType: PetUpdateResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updatePetStatus: {
        summary: '반려동물 상태 변경',
        description: '분양 반려동물의 상태를 변경합니다.',
        responseType: PetStatusUpdateResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    removeAvailablePet: {
        summary: '분양 가능한 반려동물 삭제',
        description: '등록된 분양 반려동물을 삭제합니다.',
        responseType: PetRemoveResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    receivedApplications: {
        summary: '받은 입양 신청 목록 조회',
        description: '브리더가 받은 입양 신청들을 페이지네이션으로 조회합니다.',
        responseType: ReceivedApplicationListResponseDto,
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
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    updateApplicationStatus: {
        summary: '입양 신청 상태 업데이트',
        description: '받은 입양 신청의 상태를 변경합니다.',
        responseType: ApplicationStatusUpdateResponseDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    myPets: {
        summary: '내 개체 목록 조회',
        description:
            '브리더 자신의 모든 개체 목록을 관리 목적으로 조회합니다. 비활성화된 개체, 상태별 필터링, 입양 신청 수 등 상세 정보가 포함됩니다.',
        responseType: MyPetsListResponseDto,
        itemType: MyPetItemDto,
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    myReviews: {
        summary: '내게 달린 후기 목록 조회',
        description:
            '브리더 자신에게 작성된 모든 후기를 관리 목적으로 조회합니다. 공개/비공개 후기 모두 확인 가능하며, 신고된 후기 정보도 포함됩니다.',
        responseType: MyReviewsListResponseDto,
        itemType: MyReviewItemDto,
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
        isPublic: false,
        errorResponses: [BREEDER_MANAGEMENT_BAD_REQUEST_RESPONSE, BREEDER_MANAGEMENT_FORBIDDEN_RESPONSE],
    },
    deleteReviewReply: {
        summary: '후기 답글 삭제',
        description: `브리더가 자신이 작성한 답글을 삭제합니다.

**제한사항:**
- 자신이 작성한 답글만 삭제 가능`,
        responseType: ReviewReplyDeleteResponseDto,
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

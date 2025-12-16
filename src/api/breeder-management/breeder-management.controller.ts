import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';

import { Roles } from '../../common/decorator/roles.decorator';
import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../common/decorator/swagger.decorator';
import { RolesGuard } from '../../common/guard/roles.guard';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

import { BreederManagementService } from './breeder-management.service';

import { ParentPetAddDto } from './dto/request/parent-pet-add-request.dto';
import { ParentPetUpdateDto } from './dto/request/parent-pet-update-request.dto';
import { AvailablePetAddDto } from './dto/request/available-pet-add-request.dto';
import { ProfileUpdateRequestDto } from './dto/request/profile-update-request.dto';
import { PetStatusUpdateRequestDto } from './dto/request/pet-status-update-request.dto';
import { ApplicationsGetRequestDto } from './dto/request/applications-fetch-request.dto';
import { VerificationSubmitRequestDto } from './dto/request/verification-submit-request.dto';
import { ApplicationFormUpdateRequestDto } from './dto/request/application-form-update-request.dto';
import { ApplicationStatusUpdateRequestDto } from './dto/request/application-status-update-request.dto';
import { UploadDocumentsRequestDto } from './dto/request/upload-documents-request.dto';
import { SubmitDocumentsRequestDto } from './dto/request/submit-documents-request.dto';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { PetAddResponseDto } from './dto/response/pet-add-response.dto';
import { PetUpdateResponseDto } from './dto/response/pet-update-response.dto';
import { PetRemoveResponseDto } from './dto/response/pet-remove-response.dto';
import { BreederProfileResponseDto } from '../breeder/dto/response/breeder-profile-response.dto';
import { PetStatusUpdateResponseDto } from './dto/response/pet-status-update-response.dto';
import { ApplicationFormResponseDto } from './dto/response/application-form-response.dto';
import { BreederDashboardResponseDto } from '../breeder/dto/response/breeder-dashboard-response.dto';
import { VerificationSubmitResponseDto } from './dto/response/verification-submit-response.dto';
import { VerificationStatusResponseDto } from './dto/response/verification-status-response.dto';
import { ReceivedApplicationResponseDto } from '../breeder/dto/response/received-application-response.dto';
import { BreederProfileUpdateResponseDto } from './dto/response/profile-update-response.dto';
import { ApplicationFormUpdateResponseDto } from './dto/response/application-form-update-response.dto';
import { ReceivedApplicationListResponseDto } from '../breeder/dto/response/received-application-list-response.dto';
import { ApplicationStatusUpdateResponseDto } from './dto/response/application-status-update-response.dto';
import { MyPetsListResponseDto, MyPetItemDto } from './dto/response/my-pets-list-response.dto';
import { MyReviewsListResponseDto, MyReviewItemDto } from './dto/response/my-reviews-list-response.dto';
import { UploadDocumentsResponseDto } from './dto/response/upload-documents-response.dto';

@ApiController('브리더 관리')
@Controller('breeder-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('breeder')
export class BreederManagementController {
    constructor(private readonly breederManagementService: BreederManagementService) {}

    @Get('dashboard')
    @ApiEndpoint({
        summary: '브리더 대시보드 조회',
        description: '브리더의 통계 정보와 최근 활동을 확인합니다.',
        responseType: BreederDashboardResponseDto,
        isPublic: false,
    })
    async getDashboard(@CurrentUser() user: any): Promise<ApiResponseDto<BreederDashboardResponseDto>> {
        const result = await this.breederManagementService.getDashboard(user.userId);
        return ApiResponseDto.success(result, '대시보드 정보가 조회되었습니다.');
    }

    @Get('profile')
    @ApiEndpoint({
        summary: '브리더 프로필 조회',
        description: '로그인한 브리더의 프로필 정보를 조회합니다.',
        responseType: BreederProfileResponseDto,
        isPublic: false,
    })
    async getProfile(@CurrentUser() user: any): Promise<ApiResponseDto<BreederProfileResponseDto>> {
        const result = await this.breederManagementService.getBreederProfile(user.userId);
        return ApiResponseDto.success(result, '브리더 프로필이 조회되었습니다.');
    }

    @Patch('profile')
    @ApiEndpoint({
        summary: '브리더 프로필 수정',
        description: '브리더의 프로필 정보를 업데이트합니다.',
        responseType: BreederProfileUpdateResponseDto,
        isPublic: false,
    })
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateData: ProfileUpdateRequestDto,
    ): Promise<ApiResponseDto<BreederProfileUpdateResponseDto>> {
        const result = await this.breederManagementService.updateProfile(user.userId, updateData);
        return ApiResponseDto.success(result, '프로필이 성공적으로 수정되었습니다.');
    }

    @Get('verification')
    @ApiEndpoint({
        summary: '브리더 인증 상태 조회',
        description:
            '로그인한 브리더의 인증 상태 및 관련 정보를 조회합니다. 인증 문서 URL은 1시간 유효한 Signed URL로 제공됩니다.',
        responseType: VerificationStatusResponseDto,
        isPublic: false,
    })
    async getVerificationStatus(@CurrentUser() user: any): Promise<ApiResponseDto<VerificationStatusResponseDto>> {
        const result = await this.breederManagementService.getVerificationStatus(user.userId);
        return ApiResponseDto.success(result, '인증 상태가 조회되었습니다.');
    }

    @Post('verification')
    @ApiEndpoint({
        summary: '브리더 인증 신청',
        description: '브리더 인증을 위한 서류를 제출합니다.',
        responseType: VerificationSubmitResponseDto,
        isPublic: false,
    })
    async submitVerification(
        @CurrentUser() user: any,
        @Body() verificationData: VerificationSubmitRequestDto,
    ): Promise<ApiResponseDto<VerificationSubmitResponseDto>> {
        const result = await this.breederManagementService.submitVerification(user.userId, verificationData);
        return ApiResponseDto.success(result, '인증 신청이 성공적으로 제출되었습니다.');
    }

    @Post('verification/upload')
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('multipart/form-data')
    @ApiEndpoint({
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
        isPublic: false,
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
                files: 10,
            },
        }),
    )
    async uploadVerificationDocuments(
        @CurrentUser() user: any,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: UploadDocumentsRequestDto,
    ): Promise<ApiResponseDto<UploadDocumentsResponseDto>> {
        const result = await this.breederManagementService.uploadVerificationDocuments(
            user.userId,
            files,
            dto.types,
            dto.level,
        );
        return ApiResponseDto.success(
            result,
            `${dto.level} 레벨 브리더 인증 서류 ${result.count}개가 업로드되었습니다.`,
        );
    }

    @Post('verification/submit')
    @HttpCode(HttpStatus.OK)
    @ApiEndpoint({
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
    })
    async submitVerificationDocuments(
        @CurrentUser() user: any,
        @Body() dto: SubmitDocumentsRequestDto,
    ): Promise<ApiResponseDto<VerificationSubmitResponseDto>> {
        const result = await this.breederManagementService.submitVerificationDocuments(user.userId, dto);
        return ApiResponseDto.success(result, '입점 서류 제출이 완료되었습니다.');
    }

    @Post('parent-pets')
    @ApiEndpoint({
        summary: '부모견/부모묘 추가',
        description: '새로운 부모 반려동물을 등록합니다.',
        responseType: PetAddResponseDto,
        isPublic: false,
    })
    async addParentPet(
        @CurrentUser() user: any,
        @Body() parentPetDto: ParentPetAddDto,
    ): Promise<ApiResponseDto<PetAddResponseDto>> {
        const result = await this.breederManagementService.addParentPet(user.userId, parentPetDto);
        return ApiResponseDto.success(result, '부모 반려동물이 성공적으로 등록되었습니다.');
    }

    @Patch('parent-pets/:petId')
    @ApiEndpoint({
        summary: '부모견/부모묘 정보 수정',
        description: '등록된 부모 반려동물의 정보를 수정합니다.',
        responseType: PetUpdateResponseDto,
        isPublic: false,
    })
    async updateParentPet(
        @CurrentUser() user: any,
        @Param('petId') petId: string,
        @Body() updateData: ParentPetUpdateDto,
    ): Promise<ApiResponseDto<PetUpdateResponseDto>> {
        const result = await this.breederManagementService.updateParentPet(user.userId, petId, updateData);
        return ApiResponseDto.success(result, '부모 반려동물 정보가 성공적으로 수정되었습니다.');
    }

    @Delete('parent-pets/:petId')
    @ApiEndpoint({
        summary: '부모견/부모묘 삭제',
        description: '등록된 부모 반려동물을 삭제합니다.',
        responseType: PetRemoveResponseDto,
        isPublic: false,
    })
    async removeParentPet(
        @CurrentUser() user: any,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetRemoveResponseDto>> {
        const result = await this.breederManagementService.removeParentPet(user.userId, petId);
        return ApiResponseDto.success(result, '부모 반려동물이 성공적으로 삭제되었습니다.');
    }

    @Post('available-pets')
    @ApiEndpoint({
        summary: '분양 가능한 반려동물 추가',
        description: '새로운 분양 가능한 반려동물을 등록합니다.',
        responseType: PetAddResponseDto,
        isPublic: false,
    })
    async addAvailablePet(
        @CurrentUser() user: any,
        @Body() availablePetDto: AvailablePetAddDto,
    ): Promise<ApiResponseDto<PetAddResponseDto>> {
        const result = await this.breederManagementService.addAvailablePet(user.userId, availablePetDto);
        return ApiResponseDto.success(result, '분양 반려동물이 성공적으로 등록되었습니다.');
    }

    @Patch('available-pets/:petId')
    @ApiEndpoint({
        summary: '분양 가능한 반려동물 정보 수정',
        description: '등록된 분양 반려동물의 정보를 수정합니다.',
        responseType: PetUpdateResponseDto,
        isPublic: false,
    })
    async updateAvailablePet(
        @CurrentUser() user: any,
        @Param('petId') petId: string,
        @Body() updateData: Partial<AvailablePetAddDto>,
    ): Promise<ApiResponseDto<PetUpdateResponseDto>> {
        const result = await this.breederManagementService.updateAvailablePet(user.userId, petId, updateData);
        return ApiResponseDto.success(result, '분양 반려동물 정보가 성공적으로 수정되었습니다.');
    }

    @Patch('available-pets/:petId/status')
    @ApiEndpoint({
        summary: '반려동물 상태 변경',
        description: '분양 반려동물의 상태를 변경합니다.',
        responseType: PetStatusUpdateResponseDto,
        isPublic: false,
    })
    async updatePetStatus(
        @CurrentUser() user: any,
        @Param('petId') petId: string,
        @Body() statusData: PetStatusUpdateRequestDto,
    ): Promise<ApiResponseDto<PetStatusUpdateResponseDto>> {
        const result = await this.breederManagementService.updatePetStatus(user.userId, petId, statusData.petStatus);
        return ApiResponseDto.success(result, '반려동물 상태가 성공적으로 변경되었습니다.');
    }

    @Delete('available-pets/:petId')
    @ApiEndpoint({
        summary: '분양 가능한 반려동물 삭제',
        description: '등록된 분양 반려동물을 삭제합니다.',
        responseType: PetRemoveResponseDto,
        isPublic: false,
    })
    async removeAvailablePet(
        @CurrentUser() user: any,
        @Param('petId') petId: string,
    ): Promise<ApiResponseDto<PetRemoveResponseDto>> {
        const result = await this.breederManagementService.removeAvailablePet(user.userId, petId);
        return ApiResponseDto.success(result, '분양 반려동물이 성공적으로 삭제되었습니다.');
    }

    @Get('applications')
    @ApiEndpoint({
        summary: '받은 입양 신청 목록 조회',
        description: '브리더가 받은 입양 신청들을 페이지네이션으로 조회합니다.',
        responseType: ReceivedApplicationListResponseDto,
        isPublic: false,
    })
    async getReceivedApplications(
        @CurrentUser() user: any,
        @Query() queryParams: ApplicationsGetRequestDto,
    ): Promise<ApiResponseDto<ReceivedApplicationListResponseDto>> {
        const result = await this.breederManagementService.getReceivedApplications(
            user.userId,
            queryParams.page || 1,
            queryParams.take || 10,
        );
        return ApiResponseDto.success(result, '입양 신청 목록이 조회되었습니다.');
    }

    @Get('applications/:applicationId')
    @ApiEndpoint({
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
        responseType: ReceivedApplicationResponseDto,
        isPublic: false,
    })
    async getApplicationDetail(
        @CurrentUser() user: any,
        @Param('applicationId') applicationId: string,
    ): Promise<ApiResponseDto<ReceivedApplicationResponseDto>> {
        const result = await this.breederManagementService.getApplicationDetail(user.userId, applicationId);
        return ApiResponseDto.success(result, '입양 신청 상세 정보가 조회되었습니다.');
    }

    @Patch('applications/:applicationId')
    @ApiEndpoint({
        summary: '입양 신청 상태 업데이트',
        description: '받은 입양 신청의 상태를 변경합니다.',
        responseType: ApplicationStatusUpdateResponseDto,
        isPublic: false,
    })
    async updateApplicationStatus(
        @CurrentUser() user: any,
        @Param('applicationId') applicationId: string,
        @Body() updateData: ApplicationStatusUpdateRequestDto,
    ): Promise<ApiResponseDto<ApplicationStatusUpdateResponseDto>> {
        const result = await this.breederManagementService.updateApplicationStatus(
            user.userId,
            applicationId,
            updateData,
        );
        return ApiResponseDto.success(result, '입양 신청 상태가 성공적으로 변경되었습니다.');
    }

    @Get('my-pets')
    @ApiPaginatedEndpoint({
        summary: '내 개체 목록 조회',
        description:
            '브리더 자신의 모든 개체 목록을 관리 목적으로 조회합니다. 비활성화된 개체, 상태별 필터링, 입양 신청 수 등 상세 정보가 포함됩니다.',
        responseType: MyPetsListResponseDto,
        isPublic: false,
    })
    async getMyPets(
        @CurrentUser() user: any,
        @Query('status') status?: string,
        @Query('includeInactive') includeInactive?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ): Promise<ApiResponseDto<PaginationResponseDto<MyPetItemDto>>> {
        const result = await this.breederManagementService.getMyPets(
            user.userId,
            status,
            includeInactive === 'true',
            Number(page),
            Number(limit),
        );
        return ApiResponseDto.success(result, '개체 목록이 조회되었습니다.');
    }

    @Get('my-reviews')
    @ApiPaginatedEndpoint({
        summary: '내게 달린 후기 목록 조회',
        description:
            '브리더 자신에게 작성된 모든 후기를 관리 목적으로 조회합니다. 공개/비공개 후기 모두 확인 가능하며, 신고된 후기 정보도 포함됩니다.',
        responseType: MyReviewsListResponseDto,
        isPublic: false,
    })
    async getMyReviews(
        @CurrentUser() user: any,
        @Query('visibility') visibility?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<ApiResponseDto<PaginationResponseDto<MyReviewItemDto>>> {
        const result = await this.breederManagementService.getMyReviews(
            user.userId,
            visibility || 'all',
            Number(page),
            Number(limit),
        );
        return ApiResponseDto.success(result, '후기 목록이 조회되었습니다.');
    }

    @Get('application-form')
    @ApiEndpoint({
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
    })
    async getApplicationForm(@CurrentUser() user: any): Promise<ApiResponseDto<ApplicationFormResponseDto>> {
        const result = await this.breederManagementService.getApplicationForm(user.userId);
        return ApiResponseDto.success(result, '입양 신청 폼이 조회되었습니다.');
    }

    @Patch('application-form')
    @ApiEndpoint({
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
- select/radio/checkbox 타입은 options 필수

**예시:**
\`\`\`json
{
  "customQuestions": [
    {
      "id": "custom_visit_time",
      "type": "select",
      "label": "방문 가능한 시간대를 선택해주세요",
      "required": true,
      "options": ["오전", "오후", "저녁"],
      "order": 1
    },
    {
      "id": "custom_pet_preference",
      "type": "textarea",
      "label": "선호하는 반려동물의 성격을 알려주세요",
      "required": false,
      "placeholder": "예: 활발하고 사람을 좋아하는 성격",
      "order": 2
    }
  ]
}
\`\`\``,
        responseType: ApplicationFormUpdateResponseDto,
        isPublic: false,
    })
    async updateApplicationForm(
        @CurrentUser() user: any,
        @Body() updateDto: ApplicationFormUpdateRequestDto,
    ): Promise<ApiResponseDto<ApplicationFormUpdateResponseDto>> {
        const result = await this.breederManagementService.updateApplicationForm(user.userId, updateDto);
        return ApiResponseDto.success(result, '입양 신청 폼이 업데이트되었습니다.');
    }

    @Delete('account')
    @ApiEndpoint({
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
        responseType: Object,
        isPublic: false,
    })
    async deleteAccount(@CurrentUser() user: any, @Body() deleteData?: { reason?: string; otherReason?: string }): Promise<ApiResponseDto<{ breederId: string; deletedAt: string; message: string }>> {
        const result = await this.breederManagementService.deleteBreederAccount(user.userId, deleteData);
        return ApiResponseDto.success(result, '브리더 회원 탈퇴가 성공적으로 처리되었습니다.');
    }
}

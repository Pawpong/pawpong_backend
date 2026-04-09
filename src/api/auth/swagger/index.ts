import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

import { ApiEndpoint } from '../../../common/decorator/swagger.decorator';
import { UploadResponseDto } from '../../upload/dto/response/upload-response.dto';
import { ProfileBannerResponseDto } from '../../breeder-management/admin/dto/response/profile-banner-response.dto';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/auth-response-messages';
import {
    AUTH_PHONE_SEND_FAILURE_RESPONSE,
    AUTH_REFRESH_UNAUTHORIZED_RESPONSE,
} from '../constants/auth-swagger.constants';
import { RefreshTokenRequestDto } from '../dto/request/refresh-token-request.dto';
import { CheckNicknameRequestDto } from '../dto/request/check-nickname-request.dto';
import { CheckEmailRequestDto } from '../dto/request/check-email-request.dto';
import { CheckBreederNameRequestDto } from '../dto/request/check-breeder-name-request.dto';
import { CheckSocialUserRequestDto } from '../dto/request/check-social-user-request.dto';
import { SocialCompleteRequestDto } from '../dto/request/social-complete-request.dto';
import { RegisterAdopterRequestDto } from '../dto/request/register-adopter-request.dto';
import { RegisterBreederRequestDto } from '../dto/request/register-breeder-request.dto';
import { TokenResponseDto } from '../dto/response/token-response.dto';
import { LogoutResponseDto } from '../dto/response/logout-response.dto';
import { PhoneVerificationResponseDto } from '../dto/response/phone-verification-response.dto';
import { RegisterAdopterResponseDto } from '../dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from '../dto/response/register-breeder-response.dto';
import { SocialCheckUserResponseDto } from '../dto/response/social-check-user-response.dto';
import { VerificationDocumentsResponseDto } from '../dto/response/verification-documents-response.dto';

function buildDuplicateCheckSchema(example: boolean) {
    return {
        type: 'object',
        properties: {
            isDuplicate: { type: 'boolean', example },
        },
        required: ['isDuplicate'],
    };
}

function ApiSocialLoginEntryEndpoint(providerLabel: string) {
    return applyDecorators(
        ApiOperation({
            summary: `${providerLabel} 로그인`,
            description: `
                ${providerLabel} OAuth 로그인을 시작합니다.

                ## 주요 기능
                - 현재 요청의 referer 또는 origin을 state에 포함해 프론트엔드 복귀 위치를 유지합니다.
                - returnUrl 쿼리가 있으면 로그인 완료 후 해당 프론트엔드 경로로 되돌아갑니다.
            `,
        }),
        ApiQuery({
            name: 'returnUrl',
            required: false,
            description: '로그인 완료 후 프론트엔드에서 복귀할 상대 경로',
            example: '/breeder/signup',
        }),
        ApiResponse({
            status: 302,
            description: `${providerLabel} OAuth 인증 페이지로 리다이렉트합니다.`,
        }),
    );
}

function ApiSocialLoginCallbackEndpoint(providerLabel: string) {
    return applyDecorators(
        ApiOperation({
            summary: `${providerLabel} 로그인 콜백`,
            description: `
                ${providerLabel} OAuth 인증 결과를 받아 프론트엔드로 리다이렉트합니다.

                ## 주요 기능
                - 기존 가입자는 로그인 쿠키 적용 후 성공 페이지로 이동합니다.
                - 신규 사용자는 회원가입 플로우로 이동합니다.
                - 실패 시 로그인 페이지로 에러 파라미터와 함께 이동합니다.
            `,
        }),
        ApiResponse({
            status: 302,
            description: '로그인 결과에 따라 프론트엔드 페이지로 리다이렉트합니다.',
        }),
    );
}

export function ApiAuthController() {
    return ApiTags('인증');
}

export function ApiRefreshAuthEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '토큰 재발급',
            description: `
                Refresh 토큰을 사용해 새로운 Access Token과 Refresh Token을 발급합니다.

                ## 주요 기능
                - 기존 Refresh Token을 검증한 뒤 새 토큰 쌍을 발급합니다.
                - 새 Refresh Token 해시로 세션 저장소를 갱신합니다.
            `,
            responseType: TokenResponseDto,
            isPublic: true,
            successDescription: '토큰 재발급 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.tokenRefreshed,
            errorResponses: [AUTH_REFRESH_UNAUTHORIZED_RESPONSE],
        }),
        ApiBody({ type: RefreshTokenRequestDto }),
    );
}

export function ApiLogoutAuthEndpoint() {
    return ApiEndpoint({
        summary: '로그아웃',
        description: `
            현재 로그인한 사용자를 로그아웃 처리합니다.

            ## 주요 기능
            - 저장된 Refresh Token을 무효화합니다.
            - accessToken, refreshToken, userRole 쿠키를 만료 처리합니다.
        `,
        responseType: LogoutResponseDto,
        successDescription: '로그아웃 성공',
        successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
    });
}

export function ApiSendPhoneVerificationCodeEndpoint() {
    return ApiEndpoint({
        summary: '전화번호 인증코드 발송',
        description: `
            전화번호로 6자리 인증코드를 발송합니다.

            ## 주요 기능
            - 이미 가입된 전화번호는 화이트리스트가 아니면 차단합니다.
            - 유효 기간 안에 기존 코드가 있으면 재발송을 막습니다.
        `,
        responseType: PhoneVerificationResponseDto,
        isPublic: true,
        successDescription: '인증번호 발송 성공',
        successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent,
        errorResponses: [AUTH_PHONE_SEND_FAILURE_RESPONSE],
    });
}

export function ApiVerifyPhoneVerificationCodeEndpoint() {
    return ApiEndpoint({
        summary: '전화번호 인증코드 확인',
        description: `
            발송된 인증코드를 검증합니다.

            ## 주요 기능
            - 전화번호를 정규화한 뒤 저장된 인증 정보를 조회합니다.
            - 만료, 시도 횟수 초과, 코드 불일치 여부를 검증합니다.
        `,
        responseType: PhoneVerificationResponseDto,
        isPublic: true,
        successDescription: '전화번호 인증 성공',
        successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted,
    });
}

export function ApiGoogleLoginEndpoint() {
    return ApiSocialLoginEntryEndpoint('구글');
}

export function ApiGoogleCallbackEndpoint() {
    return ApiSocialLoginCallbackEndpoint('구글');
}

export function ApiNaverLoginEndpoint() {
    return ApiSocialLoginEntryEndpoint('네이버');
}

export function ApiNaverCallbackEndpoint() {
    return ApiSocialLoginCallbackEndpoint('네이버');
}

export function ApiKakaoLoginEndpoint() {
    return ApiSocialLoginEntryEndpoint('카카오');
}

export function ApiKakaoCallbackEndpoint() {
    return ApiSocialLoginCallbackEndpoint('카카오');
}

export function ApiCompleteSocialRegistrationEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '소셜 로그인 회원가입 완료',
            description: `
                소셜 로그인 후 역할에 따라 입양자 또는 브리더 회원가입을 완료합니다.

                ## 입양자 필수 값
                - tempId
                - email
                - name
                - role=adopter
                - nickname

                ## 브리더 필수 값
                - tempId
                - email
                - name
                - role=breeder
                - phone
                - breederName
                - city
                - petType
                - breeds
                - plan
                - level
            `,
            dataSchema: {
                oneOf: [
                    { $ref: getSchemaPath(RegisterAdopterResponseDto) },
                    { $ref: getSchemaPath(RegisterBreederResponseDto) },
                ],
            },
            additionalModels: [RegisterAdopterResponseDto, RegisterBreederResponseDto],
            isPublic: true,
            successDescription: '소셜 회원가입 완료',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted,
        }),
        ApiBody({ type: SocialCompleteRequestDto }),
    );
}

export function ApiCheckEmailDuplicateEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '이메일 중복 체크',
            description: `
                입력한 이메일이 이미 가입되어 있는지 확인합니다.

                ## 주요 기능
                - 입양자/브리더 저장소를 기준으로 이메일 중복 여부를 조회합니다.
                - data.isDuplicate로 결과를 반환합니다.
            `,
            dataSchema: buildDuplicateCheckSchema(false),
            isPublic: true,
            successDescription: '이메일 중복 체크 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.emailAvailable,
        }),
        ApiBody({ type: CheckEmailRequestDto }),
    );
}

export function ApiCheckNicknameDuplicateEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '닉네임 중복 체크',
            description: `
                입력한 닉네임이 이미 사용 중인지 확인합니다.

                ## 주요 기능
                - 입양자 닉네임을 기준으로 중복 여부를 조회합니다.
                - data.isDuplicate로 결과를 반환합니다.
            `,
            dataSchema: buildDuplicateCheckSchema(false),
            isPublic: true,
            successDescription: '닉네임 중복 체크 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameAvailable,
        }),
        ApiBody({ type: CheckNicknameRequestDto }),
    );
}

export function ApiCheckBreederNameDuplicateEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 상호명 중복 체크',
            description: `
                입력한 브리더 상호명이 이미 사용 중인지 확인합니다.

                ## 주요 기능
                - 브리더 상호명을 기준으로 중복 여부를 조회합니다.
                - data.isDuplicate로 결과를 반환합니다.
            `,
            dataSchema: buildDuplicateCheckSchema(false),
            isPublic: true,
            successDescription: '브리더 상호명 중복 체크 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameAvailable,
        }),
        ApiBody({ type: CheckBreederNameRequestDto }),
    );
}

export function ApiCheckSocialUserEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '소셜 로그인 사용자 존재 여부 확인',
            description: `
                소셜 로그인 제공자와 사용자 ID로 기존 가입 여부를 확인합니다.

                ## 주요 기능
                - 기존 계정이 있으면 사용자 역할과 기본 프로필 정보를 반환합니다.
                - 계정이 없으면 회원가입 플로우 진입을 위한 미가입 응답을 반환합니다.
            `,
            responseType: SocialCheckUserResponseDto,
            isPublic: true,
            successDescription: '소셜 사용자 확인 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound,
        }),
        ApiBody({ type: CheckSocialUserRequestDto }),
    );
}

export function ApiRegisterAdopterEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '입양자 회원가입',
            description: `
                소셜 로그인 기반 입양자 회원가입을 완료합니다.

                ## 주요 기능
                - tempId에서 소셜 식별자를 파싱합니다.
                - 닉네임 중복을 검증하고 입양자 계정을 생성합니다.
                - 발급된 Access/Refresh Token을 함께 반환합니다.
            `,
            responseType: RegisterAdopterResponseDto,
            isPublic: true,
            successDescription: '입양자 회원가입 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted,
        }),
        ApiBody({ type: RegisterAdopterRequestDto }),
    );
}

export function ApiRegisterBreederEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 회원가입',
            description: `
                일반 가입 또는 소셜 로그인 기반 브리더 회원가입을 완료합니다.

                ## 주요 기능
                - 필수 약관 동의 여부를 검증합니다.
                - 임시 업로드 정보가 있으면 프로필 이미지와 서류를 회원가입 데이터에 병합합니다.
                - 브리더 계정 생성 후 Access/Refresh Token을 함께 반환합니다.
            `,
            responseType: RegisterBreederResponseDto,
            isPublic: true,
            successDescription: '브리더 회원가입 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted,
        }),
        ApiBody({ type: RegisterBreederRequestDto }),
    );
}

export function ApiUploadProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '프로필 이미지 업로드',
            description: `
                회원가입 전후에 사용할 프로필 이미지를 업로드합니다.

                ## 주요 기능
                - 응답의 filename을 회원가입 API의 profileImage 값으로 사용하는 계약입니다.
                - tempId가 있으면 임시 업로드 저장소에 보관됩니다.
                - 로그인된 사용자는 업로드 즉시 프로필에 반영됩니다.
            `,
            responseType: UploadResponseDto,
            isPublic: true,
            successDescription: '프로필 이미지 업로드 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.profileImageUploaded,
        }),
        ApiConsumes('multipart/form-data'),
        ApiQuery({
            name: 'tempId',
            required: false,
            description: '회원가입 진행 중인 소셜 임시 사용자 ID',
            example: 'temp_google_123456_1710000000000',
        }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    file: {
                        type: 'string',
                        format: 'binary',
                        description: '업로드할 프로필 이미지 파일',
                    },
                },
                required: ['file'],
            },
        }),
    );
}

export function ApiGetLoginBannersEndpoint() {
    return ApiEndpoint({
        summary: '로그인 페이지 배너 조회',
        description: `
            로그인 페이지에 노출할 활성 프로필 배너를 조회합니다.

            ## 주요 기능
            - 공개 API로 동작합니다.
            - login 위치에 활성화된 배너만 반환합니다.
        `,
        responseType: [ProfileBannerResponseDto],
        isPublic: true,
        successDescription: '로그인 배너 조회 성공',
        successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed,
    });
}

export function ApiGetRegisterBannersEndpoint() {
    return ApiEndpoint({
        summary: '회원가입 페이지 배너 조회',
        description: `
            회원가입 플로우에 노출할 활성 프로필 배너를 조회합니다.

            ## 주요 기능
            - 공개 API로 동작합니다.
            - signup 위치에 활성화된 배너만 반환합니다.
        `,
        responseType: [ProfileBannerResponseDto],
        isPublic: true,
        successDescription: '회원가입 배너 조회 성공',
        successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed,
    });
}

export function ApiUploadBreederDocumentsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '브리더 인증 서류 업로드',
            description: `
                브리더 회원가입 전후에 사용할 인증 서류를 업로드합니다.

                ## 주요 기능
                - 응답의 uploadedDocuments/allDocuments 안 filename 값을 documentUrls로 저장하는 계약입니다.
                - tempId가 있으면 임시 업로드 저장소에 문서 메타데이터를 보관합니다.
                - 필수 서류 여부와 레벨별 허용 조합은 유스케이스에서 검증합니다.
            `,
            responseType: VerificationDocumentsResponseDto,
            isPublic: true,
            successDescription: '브리더 인증 서류 업로드 성공',
            successMessageExample: AUTH_RESPONSE_MESSAGE_EXAMPLES.breederDocumentsUploaded,
        }),
        ApiConsumes('multipart/form-data'),
        ApiQuery({
            name: 'tempId',
            required: false,
            description: '회원가입 진행 중인 소셜 임시 사용자 ID',
            example: 'temp_kakao_123456_1710000000000',
        }),
        ApiBody({
            schema: {
                type: 'object',
                properties: {
                    level: {
                        type: 'string',
                        enum: ['new', 'elite'],
                        description: '브리더 레벨',
                        example: 'new',
                    },
                    types: {
                        type: 'string',
                        description: 'JSON 문자열 배열 형태의 서류 타입 목록',
                        example: '["idCard","animalProductionLicense"]',
                    },
                    files: {
                        type: 'array',
                        description: '업로드할 브리더 인증 서류 파일 목록',
                        items: {
                            type: 'string',
                            format: 'binary',
                        },
                    },
                },
                required: ['level', 'types', 'files'],
            },
        }),
    );
}

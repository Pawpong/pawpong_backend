import { applyDecorators } from '@nestjs/common';

import {
    ApiController,
    ApiEndpoint,
    ApiPaginatedEndpoint,
} from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from '../constants/breeder-pet-posting-response-messages';
import { BreederPetPostingCardResponseDto } from '../dto/response/breeder-pet-posting-card.dto';
import { CreateBreederPetPostingResponseDto } from '../dto/response/breeder-pet-posting-response.dto';

const BREEDER_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '브리더 정보를 찾을 수 없음',
    errorExample: '브리더 정보를 찾을 수 없습니다.',
} as const;

const VALIDATION_ERROR_RESPONSE = {
    status: 400,
    description: '입력 검증 실패',
    errorExample: '이미지를 최소 1장 이상 업로드해주세요.',
} as const;

export function ApiBreederPetPostingProtectedController() {
    return ApiController('분양글 (브리더, v2)');
}

export function ApiCreateBreederPetPostingEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '분양글 작성 (v2)',
            description: `
                Figma 분양글 작성 화면(566:30126) 기준의 v2 분양글 작성 API.

                ## 입력 요약
                - photos 1~10장 + representativePhotoIndex
                - 기본 정보: name, breed, gender, birthDate, price, description
                - 건강 정보:
                  - vaccinationStatus = completed → vaccinationRecords 1개 이상 필수
                  - vaccinationStatus = incomplete → vaccinationIncompleteReason 필수
                  - geneticTestStatus 동일 규칙
                - 부모 정보 스냅샷 0~2개 (엄마/아빠 각 최대 1)
                - breedingEnvironment (옵션, description + 사진 1장)

                ## 권한
                - JWT 인증 + StrictRolesGuard('breeder')
                - admin/adopter 호출은 403 으로 차단된다.
            `,
            responseType: CreateBreederPetPostingResponseDto,
            successDescription: '분양글 작성 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.created,
            errorResponses: [VALIDATION_ERROR_RESPONSE, BREEDER_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiListMyBreederPetPostingsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            summary: '내 분양글 목록 (마이홈 분양목록 탭)',
            description: `
                Figma 마이홈 분양목록 탭(290:795) 의 백엔드 진입점.

                ## 정렬 / 필터
                - 작성 시각 desc (createdAt)
                - status 필터(선택): available / reserved / adopted

                ## 응답
                - Card 응답: representativePhotoIndex 기반의 primaryPhotoUrl + photoUrls signed URL 일괄 변환
                - ageDescription 한국어 표현 ("6개월", "2살 3개월")
            `,
            responseType: PaginationResponseDto,
            itemType: BreederPetPostingCardResponseDto,
            successDescription: '내 분양글 목록 조회 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.myListRetrieved,
        }),
    );
}

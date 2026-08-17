import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { ApiController, ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../../common/dto/pagination/pagination-response.dto';
import { BREEDER_PET_POSTING_RESPONSE_MESSAGES } from '../constants/breeder-pet-posting-response-messages';
import { BreederPetPostingCardResponseDto } from '../dto/response/breeder-pet-posting-card.dto';
import { BreederPetPostingDeleteResponseDto } from '../dto/response/breeder-pet-posting-delete-response.dto';
import {
    BreederPetPostingDraftCardResponseDto,
    BreederPetPostingDraftDetailResponseDto,
    DeleteBreederPetPostingDraftResponseDto,
    SaveBreederPetPostingDraftResponseDto,
} from '../dto/response/breeder-pet-posting-draft-response.dto';
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

const POSTING_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '분양글 미존재 / 본인 글 아님',
    errorExample: '해당 분양글을 찾을 수 없습니다.',
} as const;

export function ApiBreederPetPostingProtectedController() {
    return ApiController('분양글 (브리더)');
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
                - breedingEnvironment (옵션, description + photoFileNames 최대 5장)
                - draftId (옵션): 임시저장에서 이어서 등록한 경우 전달하면 등록 성공 시 해당 임시저장이 삭제됩니다.

                ## 권한
                - JWT 인증 + StrictRolesGuard('breeder')
                - admin/adopter 호출은 403 으로 차단됩니다.
            `,
            responseType: CreateBreederPetPostingResponseDto,
            successDescription: '분양글 작성 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.created,
            errorResponses: [VALIDATION_ERROR_RESPONSE, BREEDER_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiUpdateBreederPetPostingEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '분양글 부분 수정 (v2, 작성자 본인)',
            description: `
                v2 분양글의 단순/안전 필드를 부분 수정합니다.

                ## 지원 필드 (화이트리스트)
                - name, breed, gender, birthDate, price, description, petType
                - status (분양 상태 전환: available / reserved / adopted)
                - photos / representativePhotoIndex (photos 제공 시 1~10 + 대표 인덱스 범위 검증)

                ## 제외된 필드
                - vaccinationStatus/Records/IncompleteReason
                - geneticTestStatus/Records/IncompleteReason
                - parentPetSnapshots
                - breedingEnvironment

                위 필드들은 cross-field 정합성이 복잡하여 별도 PR 에서 다룹니다. 본 endpoint 에 보내면 무시됩니다.

                ## 권한
                - JWT 인증 + StrictRolesGuard('breeder')
                - 본인 글이 아니거나 이미 비활성/미존재면 400 ("해당 분양글을 찾을 수 없습니다.") — 다른 브리더 소유 정보 누설 방지를 위해 403 대신 400 통일
            `,
            responseType: CreateBreederPetPostingResponseDto,
            successDescription: '분양글 수정 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.updated,
            errorResponses: [VALIDATION_ERROR_RESPONSE, BREEDER_NOT_FOUND_RESPONSE, POSTING_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'petId', description: '분양글(펫) ID', example: '507f1f77bcf86cd799439011' }),
    );
}

export function ApiDeleteBreederPetPostingEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '분양글 삭제 (v2, soft, 작성자 본인)',
            description: `
                v2 분양글을 isActive=false 로 soft delete 합니다.

                - 다른 도메인(상담 신청/즐겨찾기 등)이 참조하므로 도큐먼트는 보존합니다.
                - 본인 글이 아니거나 이미 비활성/미존재면 400 ("해당 분양글을 찾을 수 없습니다.")
                - 권한: JWT + StrictRolesGuard('breeder')
            `,
            responseType: BreederPetPostingDeleteResponseDto,
            successDescription: '분양글 삭제 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.deleted,
            errorResponses: [BREEDER_NOT_FOUND_RESPONSE, POSTING_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'petId', description: '분양글(펫) ID', example: '507f1f77bcf86cd799439011' }),
    );
}

const DRAFT_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '임시저장 글 미존재 / 본인 글 아님',
    errorExample: '해당 임시저장 글을 찾을 수 없습니다.',
} as const;

export function ApiSaveBreederPetPostingDraftEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '분양글 임시저장 (신규)',
            description: `
                작성 중인 분양글 폼 상태를 임시저장합니다.

                - body 는 분양글 작성 요청과 동일한 shape 이며 **중첩 구조까지 포함해** 전 필드가 옵션입니다
                  (예: 접종명만 쓰다 만 기록, 빈 photos 배열도 저장 가능)
                - 타입/형식 검증만 적용됩니다 (문자열·숫자·enum·날짜 형식, photos 최대 10장·사육환경 사진 최대 5장)
                - 접종/검사 상태-기록 상호 배타 같은 cross-field 규칙은 임시저장 단계에서 강제하지 않습니다
                - 브리더당 최대 10개까지 보관됩니다 (초과 시 400)
                - 등록 시에는 일반 분양글 작성 API 에 draftId 를 함께 보내면 해당 임시저장이 자동 삭제됩니다
            `,
            responseType: SaveBreederPetPostingDraftResponseDto,
            successDescription: '임시저장 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftSaved,
            errorResponses: [
                BREEDER_NOT_FOUND_RESPONSE,
                {
                    status: 400,
                    description: '임시저장 상한 초과',
                    errorExample: '임시저장은 최대 10개까지 보관할 수 있습니다.',
                },
            ],
        }),
    );
}

export function ApiUpdateBreederPetPostingDraftEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '분양글 임시저장 덮어쓰기',
            description: `
                기존 임시저장 글을 현재 폼 상태로 덮어씁니다.

                - body 규칙은 신규 임시저장과 동일합니다
                - 본인 글이 아니거나 미존재면 400 ("해당 임시저장 글을 찾을 수 없습니다.")
            `,
            responseType: SaveBreederPetPostingDraftResponseDto,
            successDescription: '임시저장 덮어쓰기 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftSaved,
            errorResponses: [BREEDER_NOT_FOUND_RESPONSE, DRAFT_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'draftId', description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' }),
    );
}

export function ApiListMyBreederPetPostingDraftsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '내 임시저장 목록',
            description: `
                내 분양글 임시저장 목록을 마지막 저장 시각 최신순으로 반환합니다.

                - 카드 필드(name/breed/primaryPhotoUrl)는 미입력 시 null 입니다
                - 브리더당 최대 10개라 페이지네이션 없이 전체를 반환합니다
            `,
            responseType: [BreederPetPostingDraftCardResponseDto],
            successDescription: '임시저장 목록 조회 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftListRetrieved,
            errorResponses: [BREEDER_NOT_FOUND_RESPONSE],
        }),
    );
}

export function ApiGetBreederPetPostingDraftEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '임시저장 글 단건 조회 (폼 복원용)',
            description: `
                저장했던 작성 폼 payload 를 그대로 반환합니다. 작성 화면 이어쓰기 진입 시 호출합니다.

                - form 은 분양글 작성 요청과 동일 shape 이며 저장 당시 보낸 필드만 들어 있습니다
                - 본인 글이 아니거나 미존재면 400 ("해당 임시저장 글을 찾을 수 없습니다.")
            `,
            responseType: BreederPetPostingDraftDetailResponseDto,
            successDescription: '임시저장 글 조회 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftRetrieved,
            errorResponses: [BREEDER_NOT_FOUND_RESPONSE, DRAFT_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'draftId', description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' }),
    );
}

export function ApiDeleteBreederPetPostingDraftEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            summary: '임시저장 글 삭제',
            description: `
                임시저장 글을 삭제합니다 (hard delete — 다른 도메인이 참조하지 않음).

                - 본인 글이 아니거나 미존재면 400 ("해당 임시저장 글을 찾을 수 없습니다.")
            `,
            responseType: DeleteBreederPetPostingDraftResponseDto,
            successDescription: '임시저장 글 삭제 성공',
            successMessageExample: BREEDER_PET_POSTING_RESPONSE_MESSAGES.draftDeleted,
            errorResponses: [BREEDER_NOT_FOUND_RESPONSE, DRAFT_NOT_FOUND_RESPONSE],
        }),
        ApiParam({ name: 'draftId', description: '임시저장 글 ID', example: '507f1f77bcf86cd799439099' }),
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

import { applyDecorators } from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

import { ApiEndpoint, ApiPaginatedEndpoint, ApiPublicController } from '../../../common/decorator/swagger.decorator';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { BreederSearchResponseDto } from '../dto/response/breeder-search-response.dto';
import { BreederExploreResponseDto } from '../dto/response/breeder-explore-response.dto';
import { BreederCardResponseDto } from '../dto/response/breeder-card-response.dto';
import { BreederProfileResponseDto } from '../dto/response/breeder-profile-response.dto';
import { BreederReviewsResponseDto, BreederReviewItemDto } from '../dto/response/breeder-reviews-response.dto';
import { PetsListResponseDto, PetItemDto } from '../dto/response/pets-list-response.dto';
import { PetDetailResponseDto } from '../dto/response/pet-detail-response.dto';
import { ParentPetListResponseDto } from '../dto/response/parent-pet-list.dto';
import { PublicApplicationFormResponseDto } from '../dto/response/public-application-form.dto';
import { BREEDER_RESPONSE_MESSAGES } from '../domain/services/breeder-response-message.service';
import { BreederSwaggerDocs } from './index';

function ApiBreederIdParam() {
    return ApiParam({
        name: 'id',
        description: '브리더 ID',
        example: '507f1f77bcf86cd799439011',
    });
}

function ApiBreederPetIdParam() {
    return ApiParam({
        name: 'petId',
        description: '분양 개체 ID',
        example: '507f1f77bcf86cd799439012',
    });
}

function ApiPageQuery(defaultValue: number) {
    return ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: '페이지 번호',
        example: defaultValue,
    });
}

function ApiLimitQuery(defaultValue: number) {
    return ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: '페이지당 조회 개수',
        example: defaultValue,
    });
}

export function ApiBreederController() {
    return ApiPublicController('브리더');
}

export function ApiSearchBreedersEndpoint() {
    return ApiEndpoint({
        ...BreederSwaggerDocs.searchBreeders,
        responseType: BreederSearchResponseDto,
        isPublic: true,
        successMessageExample: BREEDER_RESPONSE_MESSAGES.searchCompleted,
    });
}

export function ApiExploreBreedersEndpoint() {
    return ApiPaginatedEndpoint({
        ...BreederSwaggerDocs.exploreBreeders,
        responseType: BreederExploreResponseDto,
        itemType: BreederCardResponseDto,
        isPublic: true,
        successMessageExample: BREEDER_RESPONSE_MESSAGES.breederListRetrieved,
    });
}

export function ApiGetPopularBreedersEndpoint() {
    return ApiEndpoint({
        ...BreederSwaggerDocs.getPopularBreeders,
        responseType: [BreederCardResponseDto],
        isPublic: true,
        successMessageExample: BREEDER_RESPONSE_MESSAGES.popularListRetrieved,
    });
}

export function ApiGetBreederProfileEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            ...BreederSwaggerDocs.getBreederProfile,
            responseType: BreederProfileResponseDto,
            isPublic: true,
            successMessageExample: BREEDER_RESPONSE_MESSAGES.profileRetrieved,
        }),
        ApiBreederIdParam(),
    );
}

export function ApiGetBreederReviewsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            ...BreederSwaggerDocs.getBreederReviews,
            responseType: BreederReviewsResponseDto,
            itemType: BreederReviewItemDto,
            isPublic: true,
            successMessageExample: BREEDER_RESPONSE_MESSAGES.reviewsRetrieved,
        }),
        ApiBreederIdParam(),
        ApiPageQuery(1),
        ApiLimitQuery(10),
    );
}

export function ApiGetBreederPetsEndpoint() {
    return applyDecorators(
        ApiPaginatedEndpoint({
            ...BreederSwaggerDocs.getBreederPets,
            responseType: PetsListResponseDto,
            itemType: PetItemDto,
            isPublic: true,
            successMessageExample: BREEDER_RESPONSE_MESSAGES.petsRetrieved,
        }),
        ApiBreederIdParam(),
        ApiQuery({
            name: 'status',
            required: false,
            type: String,
            description: '분양 상태 필터',
            example: 'available',
        }),
        ApiPageQuery(1),
        ApiLimitQuery(20),
    );
}

export function ApiGetBreederPetDetailEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            ...BreederSwaggerDocs.getPetDetail,
            responseType: PetDetailResponseDto,
            isPublic: true,
            successMessageExample: BREEDER_RESPONSE_MESSAGES.petDetailRetrieved,
        }),
        ApiBreederIdParam(),
        ApiBreederPetIdParam(),
    );
}

export function ApiGetBreederParentPetsEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            ...BreederSwaggerDocs.getParentPets,
            responseType: ParentPetListResponseDto,
            isPublic: true,
            successMessageExample: BREEDER_RESPONSE_MESSAGES.parentPetsRetrieved,
        }),
        ApiBreederIdParam(),
        ApiPageQuery(1),
        ApiLimitQuery(20),
    );
}

export function ApiGetBreederApplicationFormEndpoint() {
    return applyDecorators(
        ApiEndpoint({
            ...BreederSwaggerDocs.getApplicationForm,
            responseType: PublicApplicationFormResponseDto,
            isPublic: true,
            successMessageExample: BREEDER_RESPONSE_MESSAGES.applicationFormRetrieved,
        }),
        ApiBreederIdParam(),
    );
}

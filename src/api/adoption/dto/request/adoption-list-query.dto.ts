import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export enum AdoptionPetTypeQuery {
    DOG = 'dog',
    CAT = 'cat',
    REPTILE = 'reptile',
}

export enum AdoptionSortQuery {
    LATEST = 'latest',
    POPULAR = 'popular',
}

export class AdoptionListQueryDto {
    @ApiProperty({
        description: '동물 종류 필터 (전체는 미지정)',
        enum: AdoptionPetTypeQuery,
        required: false,
    })
    @IsOptional()
    @IsEnum(AdoptionPetTypeQuery)
    petType?: AdoptionPetTypeQuery;

    @ApiProperty({
        description: '특정 브리더의 분양 동물만 필터링 (브리더홈 / 상세 화면의 "브리더의 다른 분양 동물" 영역)',
        required: false,
        example: '507f1f77bcf86cd799439011',
    })
    @IsOptional()
    @IsMongoId()
    breederId?: string;

    @ApiProperty({
        description: '특정 동물 ID 를 결과에서 제외 (상세 화면에서 현재 동물을 다른 분양 목록에서 제외할 때)',
        required: false,
        example: '507f1f77bcf86cd799439022',
    })
    @IsOptional()
    @IsMongoId()
    excludePetId?: string;

    @ApiProperty({
        description: '정렬 기준',
        enum: AdoptionSortQuery,
        required: false,
        default: AdoptionSortQuery.LATEST,
    })
    @IsOptional()
    @IsEnum(AdoptionSortQuery)
    sort?: AdoptionSortQuery = AdoptionSortQuery.LATEST;

    @ApiProperty({ description: '페이지 번호', required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ description: '페이지 크기 (1~60)', required: false, default: 15 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(60)
    pageSize?: number = 15;
}

export class AdoptionPopularQueryDto {
    @ApiProperty({
        description: '동물 종류 필터 (전체는 미지정)',
        enum: AdoptionPetTypeQuery,
        required: false,
    })
    @IsOptional()
    @IsEnum(AdoptionPetTypeQuery)
    petType?: AdoptionPetTypeQuery;

    @ApiProperty({ description: '반환 개수 (1~20)', required: false, default: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    limit?: number = 3;
}

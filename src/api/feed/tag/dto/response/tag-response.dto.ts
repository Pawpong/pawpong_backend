import { ApiProperty } from '@nestjs/swagger';

/**
 * 인기 태그 아이템 DTO
 */
export class PopularTagItemDto {
    @ApiProperty({ description: '태그명' })
    tag: string;

    @ApiProperty({ description: '사용된 동영상 수' })
    videoCount: number;

    @ApiProperty({ description: '총 조회수' })
    totalViews: number;
}

/**
 * 태그 자동완성 아이템 DTO
 */
export class TagSuggestionItemDto {
    @ApiProperty({ description: '태그명' })
    tag: string;

    @ApiProperty({ description: '사용된 동영상 수' })
    videoCount: number;
}

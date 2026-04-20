import { ApiProperty } from '@nestjs/swagger';

import { PageInfoDto } from '../../../../../common/dto/pagination/page-info.dto';

class FeedTagUploaderDto {
    @ApiProperty({ description: '사용자 ID' })
    _id: string;

    @ApiProperty({ description: '사용자 이름' })
    name: string;

    @ApiProperty({ description: '프로필 이미지 파일명', required: false })
    profileImageFileName?: string;

    @ApiProperty({ description: '브리더 업체명', required: false })
    businessName?: string;
}

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

export class TagSearchVideoItemDto {
    @ApiProperty({ description: '동영상 ID' })
    videoId: string;

    @ApiProperty({ description: '제목' })
    title: string;

    @ApiProperty({ description: '썸네일 URL', required: false })
    thumbnailUrl?: string | null;

    @ApiProperty({ description: '동영상 길이 (초)' })
    duration: number;

    @ApiProperty({ description: '조회수' })
    viewCount: number;

    @ApiProperty({ description: '좋아요 수' })
    likeCount: number;

    @ApiProperty({ description: '태그 목록', type: [String] })
    tags: string[];

    @ApiProperty({ description: '업로더 정보', type: FeedTagUploaderDto, required: false })
    uploadedBy?: FeedTagUploaderDto | null;

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;
}

export class TagSearchResponseDto {
    @ApiProperty({ description: '검색 결과 동영상 목록', type: [TagSearchVideoItemDto] })
    videos: TagSearchVideoItemDto[];

    @ApiProperty({ description: '검색한 태그' })
    tag: string;

    @ApiProperty({ description: '페이지네이션 정보', type: PageInfoDto })
    pagination: PageInfoDto;
}

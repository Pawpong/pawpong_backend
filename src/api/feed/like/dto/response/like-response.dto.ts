import { ApiProperty } from '@nestjs/swagger';

import { PageInfoDto } from '../../../../../common/dto/pagination/page-info.dto';

class FeedLikeUploaderDto {
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
 * 좋아요 토글 응답 DTO
 */
export class LikeToggleResponseDto {
    @ApiProperty({ description: '좋아요 상태' })
    isLiked: boolean;

    @ApiProperty({ description: '총 좋아요 수' })
    likeCount: number;
}

/**
 * 좋아요 상태 응답 DTO
 */
export class LikeStatusResponseDto {
    @ApiProperty({ description: '좋아요 여부' })
    isLiked: boolean;

    @ApiProperty({ description: '총 좋아요 수' })
    likeCount: number;
}

export class MyLikedVideoItemDto {
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

    @ApiProperty({ description: '업로더 정보', type: FeedLikeUploaderDto, required: false })
    uploadedBy?: FeedLikeUploaderDto | null;

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;
}

export class MyLikedVideosResponseDto {
    @ApiProperty({ description: '좋아요한 동영상 목록', type: [MyLikedVideoItemDto] })
    videos: MyLikedVideoItemDto[];

    @ApiProperty({ description: '페이지네이션 정보', type: PageInfoDto })
    pagination: PageInfoDto;
}

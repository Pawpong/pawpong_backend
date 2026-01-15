import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VideoStatus } from '../../../../../schema/video.schema.js';

/**
 * 업로드 URL 응답 DTO
 */
export class UploadUrlResponseDto {
    @ApiProperty({ description: '동영상 ID', example: '507f1f77bcf86cd799439011' })
    videoId: string;

    @ApiProperty({
        description: 'Presigned Upload URL (10분 유효)',
        example: 'https://kr.object.iwinv.kr/pawpong_bucket/videos/raw/xxx.mp4?...',
    })
    uploadUrl: string;

    @ApiProperty({
        description: 'S3 파일 키',
        example: 'videos/raw/abc123.mp4',
    })
    videoKey: string;
}

/**
 * 동영상 메타데이터 응답 DTO
 */
export class VideoMetaResponseDto {
    @ApiProperty({ description: '동영상 ID' })
    videoId: string;

    @ApiProperty({ description: '제목' })
    title: string;

    @ApiPropertyOptional({ description: '설명' })
    description?: string;

    @ApiProperty({ description: '처리 상태', enum: VideoStatus })
    status: VideoStatus;

    @ApiPropertyOptional({ description: 'HLS 재생 URL (50분 유효)' })
    playUrl?: string;

    @ApiPropertyOptional({ description: '썸네일 URL' })
    thumbnailUrl?: string;

    @ApiPropertyOptional({ description: '동영상 길이 (초)' })
    duration?: number;

    @ApiPropertyOptional({ description: '가로 크기 (픽셀)' })
    width?: number;

    @ApiPropertyOptional({ description: '세로 크기 (픽셀)' })
    height?: number;

    @ApiProperty({ description: '조회수' })
    viewCount: number;

    @ApiProperty({ description: '좋아요 수' })
    likeCount: number;

    @ApiProperty({ description: '댓글 수' })
    commentCount: number;

    @ApiPropertyOptional({ description: '해시태그', type: [String] })
    tags?: string[];

    @ApiProperty({ description: '업로더 정보' })
    uploadedBy: {
        _id: string;
        name: string;
        profileImageFileName?: string;
        businessName?: string;
    };

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;

    @ApiPropertyOptional({ description: '인코딩 실패 사유' })
    failureReason?: string;
}

/**
 * 피드 동영상 아이템 DTO
 */
export class FeedVideoItemDto {
    @ApiProperty({ description: '동영상 ID' })
    videoId: string;

    @ApiProperty({ description: '제목' })
    title: string;

    @ApiProperty({ description: '썸네일 URL' })
    thumbnailUrl: string;

    @ApiProperty({ description: '동영상 길이 (초)' })
    duration: number;

    @ApiProperty({ description: '조회수' })
    viewCount: number;

    @ApiPropertyOptional({ description: '좋아요 수' })
    likeCount?: number;

    @ApiProperty({ description: '업로더 정보' })
    uploadedBy: {
        _id: string;
        name: string;
        profileImageFileName?: string;
        businessName?: string;
    };

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;
}

/**
 * 피드 응답 DTO
 */
export class FeedResponseDto {
    @ApiProperty({ description: '동영상 목록', type: [FeedVideoItemDto] })
    items: FeedVideoItemDto[];

    @ApiProperty({ description: '페이지네이션 정보' })
    pagination: {
        currentPage: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * 내 동영상 아이템 DTO
 */
export class MyVideoItemDto {
    @ApiProperty({ description: '동영상 ID' })
    videoId: string;

    @ApiProperty({ description: '제목' })
    title: string;

    @ApiProperty({ description: '처리 상태', enum: VideoStatus })
    status: VideoStatus;

    @ApiPropertyOptional({ description: '썸네일 URL' })
    thumbnailUrl?: string;

    @ApiProperty({ description: '동영상 길이 (초)' })
    duration: number;

    @ApiProperty({ description: '조회수' })
    viewCount: number;

    @ApiProperty({ description: '공개 여부' })
    isPublic: boolean;

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;

    @ApiPropertyOptional({ description: '인코딩 실패 사유' })
    failureReason?: string;
}

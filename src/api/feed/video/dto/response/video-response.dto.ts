import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { VideoStatus } from '../../../../../common/enum/video-status.enum';
import { PageInfoDto } from '../../../../../common/dto/pagination/page-info.dto';

class FeedVideoUploaderDto {
    @ApiProperty({ description: '사용자 ID' })
    _id: string;

    @ApiProperty({ description: '사용자 이름' })
    name: string;

    @ApiPropertyOptional({ description: '프로필 이미지 파일명' })
    profileImageFileName?: string;

    @ApiPropertyOptional({ description: '브리더 업체명' })
    businessName?: string;
}

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

    @ApiProperty({ description: '업로더 정보', type: FeedVideoUploaderDto })
    uploadedBy: FeedVideoUploaderDto;

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;

    @ApiPropertyOptional({ description: '인코딩 실패 사유' })
    failureReason?: string;
}

export class PendingVideoMetaResponseDto {
    @ApiProperty({ description: '동영상 ID' })
    videoId: string;

    @ApiProperty({ description: '처리 상태', enum: VideoStatus })
    status: VideoStatus;

    @ApiProperty({ description: '제목' })
    title: string;

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

    @ApiProperty({ description: '업로더 정보', type: FeedVideoUploaderDto })
    uploadedBy: FeedVideoUploaderDto;

    @ApiProperty({ description: '업로드 일시' })
    createdAt: Date;
}

export class PopularVideoItemDto {
    @ApiProperty({ description: '동영상 ID' })
    videoId: string;

    @ApiProperty({ description: '제목' })
    title: string;

    @ApiPropertyOptional({ description: '썸네일 URL' })
    thumbnailUrl?: string | null;

    @ApiProperty({ description: '동영상 길이 (초)' })
    duration: number;

    @ApiProperty({ description: '조회수' })
    viewCount: number;

    @ApiProperty({ description: '업로더 정보', type: FeedVideoUploaderDto })
    uploadedBy: FeedVideoUploaderDto;
}

/**
 * 피드 응답 DTO
 */
export class FeedResponseDto {
    @ApiProperty({ description: '동영상 목록', type: [FeedVideoItemDto] })
    items: FeedVideoItemDto[];

    @ApiProperty({ description: '페이지네이션 정보', type: PageInfoDto })
    pagination: PageInfoDto;
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

export class MyVideoListResponseDto {
    @ApiProperty({ description: '내 동영상 목록', type: [MyVideoItemDto] })
    items: MyVideoItemDto[];

    @ApiProperty({ description: '페이지네이션 정보', type: PageInfoDto })
    pagination: PageInfoDto;
}

export class UploadCompleteResponseDto {
    @ApiProperty({ description: '인코딩 처리 상태', enum: VideoStatus })
    status: VideoStatus;
}

export class VideoActionSuccessResponseDto {
    @ApiProperty({ description: '작업 성공 여부', example: true })
    success: boolean;
}

export class VideoVisibilityResponseDto {
    @ApiProperty({ description: '동영상 공개 여부', example: true })
    isPublic: boolean;
}

export class SegmentPrefetchResponseDto {
    @ApiProperty({ description: '작업 성공 여부', example: true })
    success: boolean;

    @ApiProperty({ description: '프리페치 결과 메시지', example: '5개 세그먼트 프리페치 완료' })
    message: string;
}

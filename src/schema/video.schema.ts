import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 동영상 처리 상태
 */
export enum VideoStatus {
    PENDING = 'pending', // 업로드 대기
    UPLOADING = 'uploading', // 업로드 중
    PROCESSING = 'processing', // 인코딩 중
    READY = 'ready', // 재생 가능
    FAILED = 'failed', // 인코딩 실패
}

/**
 * 동영상 스키마
 * 인스타그램/틱톡 스타일의 피드형 동영상
 */
@Schema({ timestamps: true })
export class Video extends Document {
    /**
     * 업로드한 사용자 (Breeder 또는 Adopter)
     */
    @Prop({ type: Types.ObjectId, refPath: 'uploaderModel', required: true })
    uploadedBy: Types.ObjectId;

    /**
     * 업로더 모델 타입 (Breeder 또는 Adopter)
     */
    @Prop({ type: String, enum: ['Breeder', 'Adopter'], required: true })
    uploaderModel: string;

    /**
     * 동영상 제목
     */
    @Prop({ required: true, maxlength: 100 })
    title: string;

    /**
     * 동영상 설명
     */
    @Prop({ maxlength: 1000 })
    description: string;

    /**
     * 동영상 처리 상태
     */
    @Prop({ type: String, enum: VideoStatus, default: VideoStatus.PENDING, index: true })
    status: VideoStatus;

    /**
     * S3 원본 동영상 경로 (videos/raw/{uuid}.mp4)
     */
    @Prop({ required: true })
    originalKey: string;

    /**
     * HLS manifest 경로 (videos/hls/{videoId}/master.m3u8)
     * 인코딩 완료 후 설정됨
     */
    @Prop()
    hlsManifestKey: string;

    /**
     * 썸네일 이미지 경로 (videos/thumbnails/{videoId}.jpg)
     */
    @Prop()
    thumbnailKey: string;

    /**
     * 동영상 길이 (초 단위)
     */
    @Prop({ default: 0 })
    duration: number;

    /**
     * 동영상 가로 크기 (픽셀)
     */
    @Prop()
    width: number;

    /**
     * 동영상 세로 크기 (픽셀)
     */
    @Prop()
    height: number;

    /**
     * 조회수
     */
    @Prop({ default: 0, index: true })
    viewCount: number;

    /**
     * 좋아요 수
     */
    @Prop({ default: 0 })
    likeCount: number;

    /**
     * 댓글 수
     */
    @Prop({ default: 0 })
    commentCount: number;

    /**
     * 해시태그 (검색용)
     */
    @Prop({ type: [String], default: [], index: true })
    tags: string[];

    /**
     * 공개 여부
     */
    @Prop({ default: true, index: true })
    isPublic: boolean;

    /**
     * 인코딩 실패 사유
     */
    @Prop()
    failureReason: string;

    /**
     * 생성일
     */
    @Prop({ index: true })
    createdAt: Date;

    /**
     * 수정일
     */
    @Prop()
    updatedAt: Date;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

// 복합 인덱스
VideoSchema.index({ uploadedBy: 1, createdAt: -1 }); // 사용자별 동영상 목록
VideoSchema.index({ status: 1, isPublic: 1, createdAt: -1 }); // 피드 조회
VideoSchema.index({ tags: 1, createdAt: -1 }); // 태그 검색
VideoSchema.index({ viewCount: -1 }); // 인기 동영상

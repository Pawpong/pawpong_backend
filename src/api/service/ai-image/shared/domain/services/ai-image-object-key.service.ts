import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

/** 업로드 허용 MIME → 확장자 (HEIC 는 1단계 미지원 — 프론트에서 변환 필요) */
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

/**
 * 어드민이 올리는 필터 애셋의 용도별 디렉터리.
 * 용도를 키 경로에 새겨두면 고아 파일 정리·버킷 조회에서 출처를 바로 구분할 수 있다.
 */
const ADMIN_ASSET_DIRECTORIES = {
    /** 필터 목록에 노출되는 썸네일 */
    thumbnail: 'ai-image/filter',
    /** 프롬프트 스타일 참고용 레퍼런스 이미지 */
    reference: 'ai-image/reference',
    /** 미리보기로 시험할 원본 사진 (사용자 원본과 같은 규칙) */
    source: 'ai-image/source',
} as const;

/** 어드민 애셋 업로드 용도 */
export type AiImageAdminAssetPurpose = keyof typeof ADMIN_ASSET_DIRECTORIES;

/** 어드민 업로드에서 허용하는 용도 목록 (DTO 검증과 Swagger 문서가 함께 참조) */
export const AI_IMAGE_ADMIN_ASSET_PURPOSES = Object.keys(ADMIN_ASSET_DIRECTORIES) as AiImageAdminAssetPurpose[];

/**
 * AI 이미지 S3 키 규칙.
 * - 원본:      ai-image/source/{uuid}.{ext}
 * - 결과:      ai-image/result/{jobId}.png
 * - 썸네일:    ai-image/filter/{uuid}.{ext}
 * - 레퍼런스:  ai-image/reference/{uuid}.{ext}
 *
 * 결과 키를 요청 시점에 미리 정해 두면 AI Agent 가 키를 계산할 필요가 없다.
 *
 * 사용자 생성 경로와 어드민 애셋 경로가 같은 MIME 허용 규칙을 써야 하므로
 * 슬라이스마다 복제하지 않고 shared 에서 한 곳으로 관리한다.
 */
@Injectable()
export class AiImageObjectKeyService {
    resolveSourceKey(contentType: string): string {
        return `ai-image/source/${randomUUID()}.${this.resolveExtension(contentType)}`;
    }

    resolveResultKey(jobId: string): string {
        return `ai-image/result/${jobId}.png`;
    }

    /** 어드민이 업로드하는 필터 애셋 키 (용도별 디렉터리 분리) */
    resolveAdminAssetKey(purpose: AiImageAdminAssetPurpose, contentType: string): string {
        return `${ADMIN_ASSET_DIRECTORIES[purpose]}/${randomUUID()}.${this.resolveExtension(contentType)}`;
    }

    private resolveExtension(contentType: string): string {
        const extension = ALLOWED_CONTENT_TYPES[contentType.toLowerCase()];
        if (!extension) {
            throw new BadRequestException('지원하지 않는 이미지 형식입니다. (jpg, png, webp 만 가능)');
        }
        return extension;
    }
}

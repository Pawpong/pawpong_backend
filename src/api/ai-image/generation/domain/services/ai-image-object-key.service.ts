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
 * AI 이미지 S3 키 규칙.
 * - 원본:  ai-image/source/{uuid}.{ext}
 * - 결과:  ai-image/result/{jobId}.png
 * 결과 키를 요청 시점에 미리 정해 두면 AI Agent 가 키를 계산할 필요가 없다.
 */
@Injectable()
export class AiImageObjectKeyService {
    resolveSourceKey(contentType: string): string {
        const extension = ALLOWED_CONTENT_TYPES[contentType.toLowerCase()];
        if (!extension) {
            throw new BadRequestException('지원하지 않는 이미지 형식입니다. (jpg, png, webp 만 가능)');
        }
        return `ai-image/source/${randomUUID()}.${extension}`;
    }

    resolveResultKey(jobId: string): string {
        return `ai-image/result/${jobId}.png`;
    }
}

import { BadRequestException, Injectable } from '@nestjs/common';

/** 사용자·콘테스트당 기본 생성 허용 횟수 */
export const AI_IMAGE_DEFAULT_QUOTA_PER_CONTEST = 3;

/**
 * 생성 쿼터 정책.
 * 동시 1건 처리 구조라 무제한 허용 시 대기열이 길어지고 OpenAI 비용이 직결된다.
 */
@Injectable()
export class AiImageQuotaService {
    ensureWithinQuota(usedCount: number, quota: number = AI_IMAGE_DEFAULT_QUOTA_PER_CONTEST): void {
        if (usedCount >= quota) {
            throw new BadRequestException(`AI 이미지 생성 횟수를 모두 사용했습니다. (최대 ${quota}회)`);
        }
    }
}

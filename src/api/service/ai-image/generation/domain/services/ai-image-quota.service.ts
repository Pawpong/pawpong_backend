import { BadRequestException, Injectable } from '@nestjs/common';

/** 사용자·콘테스트당 기본 생성 허용 횟수 */
export const AI_IMAGE_DEFAULT_QUOTA_PER_CONTEST = 3;

/** 콘테스트 없이(커뮤니티 글쓰기 등) 쓸 때 사용자당 하루 허용 횟수 (KST 자정 기준) */
export const AI_IMAGE_DAILY_QUOTA = 3;

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 생성 쿼터 정책.
 * 동시 1건 처리 구조라 무제한 허용 시 대기열이 길어지고 OpenAI 비용이 직결된다.
 *
 * 콘테스트 참여는 콘테스트당 3회, 그 밖의 사용(커뮤니티 글쓰기)은 하루 3회다.
 * 콘테스트 기준을 그대로 쓰면 contestId 가 없는 사용이 평생 3회로 묶이기 때문에 나눴다.
 */
@Injectable()
export class AiImageQuotaService {
    ensureWithinQuota(usedCount: number, quota: number = AI_IMAGE_DEFAULT_QUOTA_PER_CONTEST): void {
        if (usedCount >= quota) {
            throw new BadRequestException(`AI 이미지 생성 횟수를 모두 사용했습니다. (최대 ${quota}회)`);
        }
    }

    ensureWithinDailyQuota(usedToday: number): void {
        if (usedToday >= AI_IMAGE_DAILY_QUOTA) {
            throw new BadRequestException(
                `오늘 AI 이미지 생성 횟수를 모두 사용했습니다. (하루 ${AI_IMAGE_DAILY_QUOTA}회, 자정에 초기화)`,
            );
        }
    }

    /** 일일 쿼터의 시작 시각 — KST 자정에 해당하는 UTC 시각 */
    startOfKstDay(now: Date): Date {
        const shifted = new Date(now.getTime() + KST_OFFSET_MS);
        return new Date(
            Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - KST_OFFSET_MS,
        );
    }
}

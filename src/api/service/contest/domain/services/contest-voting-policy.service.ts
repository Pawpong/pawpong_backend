import { Injectable } from '@nestjs/common';

import type { ContestSnapshot } from '../../application/ports/contest-reader.port';

/**
 * 콘테스트 투표/취소 허용 정책.
 * status 플래그는 운영(스케줄러/수동)이 뒤늦게 바꿀 수 있으므로,
 * endDate 경과 여부를 함께 판정해 "아직 active 로 남아 있지만 이미 끝난" 콘테스트의
 * 집계 변조를 막는다.
 */
@Injectable()
export class ContestVotingPolicyService {
    /** 투표·취소가 허용되는 열린 콘테스트인지 판정한다 */
    isOpenForVoting(contest: ContestSnapshot): boolean {
        return contest.status === 'active' && contest.endDate.getTime() > Date.now();
    }
}

import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { FeedLikePolicyService } from '../../../domain/services/feed-like-policy.service';

describe('FeedLikePolicyService', () => {
    const policy = new FeedLikePolicyService();

    it('비디오 카운터가 있으면 그대로 반환한다', () => {
        const counter = { id: 'c-1', likeCount: 5 };
        expect(policy.requireVideo(counter)).toBe(counter);
    });

    it('비디오 카운터가 null이면 DomainValidationError를 던진다', () => {
        expect(() => policy.requireVideo(null)).toThrow(DomainValidationError);
        expect(() => policy.requireVideo(null)).toThrow('동영상을 찾을 수 없습니다.');
    });
});

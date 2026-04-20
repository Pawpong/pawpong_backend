import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { FeedCommentPolicyService } from '../../../domain/services/feed-comment-policy.service';
import { FeedCommentSnapshot } from '../../../application/ports/feed-comment-manager.port';

const baseComment: FeedCommentSnapshot = {
    id: 'comment-1',
    videoId: 'video-1',
    userId: 'user-1',
    content: '내용',
    likeCount: 0,
    isDeleted: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    author: null,
};

describe('FeedCommentPolicyService', () => {
    const policy = new FeedCommentPolicyService();

    describe('requireVideo', () => {
        it('비디오가 있으면 그대로 반환한다', () => {
            expect(policy.requireVideo({ id: 'video-1' })).toEqual({ id: 'video-1' });
        });

        it('비디오가 null이면 DomainValidationError를 던진다', () => {
            expect(() => policy.requireVideo(null)).toThrow(DomainValidationError);
        });
    });

    describe('requireComment', () => {
        it('댓글이 있으면 그대로 반환한다', () => {
            expect(policy.requireComment(baseComment)).toBe(baseComment);
        });

        it('댓글이 null이면 기본 메시지로 DomainValidationError를 던진다', () => {
            expect(() => policy.requireComment(null)).toThrow('댓글을 찾을 수 없습니다.');
        });

        it('커스텀 메시지를 사용할 수 있다', () => {
            expect(() => policy.requireComment(null, '부모 댓글이 없습니다.')).toThrow('부모 댓글이 없습니다.');
        });
    });

    describe('ensureParentMatchesVideo', () => {
        it('videoId가 일치하면 통과한다', () => {
            expect(() => policy.ensureParentMatchesVideo(baseComment, 'video-1')).not.toThrow();
        });

        it('videoId가 다르면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureParentMatchesVideo(baseComment, 'other-video')).toThrow(DomainValidationError);
        });
    });

    describe('ensureOwner', () => {
        it('소유자가 일치하면 통과한다', () => {
            expect(() => policy.ensureOwner(baseComment, 'user-1')).not.toThrow();
        });

        it('소유자가 다르면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureOwner(baseComment, 'other-user')).toThrow('권한이 없습니다.');
        });
    });
});

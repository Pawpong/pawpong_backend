import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { VideoStatus } from '../../../../../../common/enum/video-status.enum';
import { FeedVideoCommandPolicyService } from '../../../domain/services/feed-video-command-policy.service';
import { FeedVideoCommandSnapshot } from '../../../application/ports/feed-video-command.port';

function makeVideo(overrides: Partial<FeedVideoCommandSnapshot> = {}): FeedVideoCommandSnapshot {
    return {
        id: 'video-1',
        uploadedById: 'user-1',
        title: '제목',
        status: VideoStatus.PENDING,
        originalKey: 'videos/raw/video-1.mp4',
        duration: 0,
        viewCount: 0,
        isPublic: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

describe('FeedVideoCommandPolicyService', () => {
    const policy = new FeedVideoCommandPolicyService();

    describe('requireVideo', () => {
        it('비디오가 있으면 그대로 반환한다', () => {
            const video = makeVideo();
            expect(policy.requireVideo(video)).toBe(video);
        });

        it('null이면 DomainValidationError를 던진다', () => {
            expect(() => policy.requireVideo(null)).toThrow(DomainValidationError);
        });
    });

    describe('ensureOwner', () => {
        it('소유자가 일치하면 통과한다', () => {
            expect(() => policy.ensureOwner(makeVideo(), 'user-1')).not.toThrow();
        });

        it('소유자가 다르면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureOwner(makeVideo(), 'other')).toThrow('권한이 없습니다.');
        });
    });

    describe('ensurePending', () => {
        it('PENDING 상태면 통과한다', () => {
            expect(() => policy.ensurePending(makeVideo({ status: VideoStatus.PENDING }))).not.toThrow();
        });

        it('PROCESSING 상태면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensurePending(makeVideo({ status: VideoStatus.PROCESSING }))).toThrow(DomainValidationError);
        });

        it('READY 상태면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensurePending(makeVideo({ status: VideoStatus.READY }))).toThrow(DomainValidationError);
        });
    });

    describe('getNextVisibility', () => {
        it('공개 상태 비디오는 비공개로 전환한다', () => {
            expect(policy.getNextVisibility(makeVideo({ isPublic: true }))).toBe(false);
        });

        it('비공개 상태 비디오는 공개로 전환한다', () => {
            expect(policy.getNextVisibility(makeVideo({ isPublic: false }))).toBe(true);
        });
    });

    describe('getRemovableFileKeys', () => {
        it('originalKey와 thumbnailKey를 모두 반환한다', () => {
            const keys = policy.getRemovableFileKeys(makeVideo({ thumbnailKey: 'thumb/v1.jpg' }));
            expect(keys).toEqual(['videos/raw/video-1.mp4', 'thumb/v1.jpg']);
        });

        it('thumbnailKey가 없으면 originalKey만 반환한다', () => {
            expect(policy.getRemovableFileKeys(makeVideo())).toEqual(['videos/raw/video-1.mp4']);
        });
    });
});

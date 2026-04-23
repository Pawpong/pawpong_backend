import { DomainValidationError } from '../../../../../common/error/domain.error';
import { InquiryViewService } from '../../../domain/services/inquiry-view.service';

const signedUrl = (name: string) => `https://cdn.example.com/${name}`;

function makeInquiry(overrides: any = {}) {
    return {
        id: 'i-1',
        title: '제목',
        content: '내용',
        type: 'general',
        animalType: 'dog',
        viewCount: 5,
        createdAt: new Date('2026-01-15T00:00:00.000Z'),
        authorId: 'user-1',
        authorNickname: '익명',
        targetBreederId: undefined,
        imageUrls: [],
        answers: [],
        ...overrides,
    };
}

describe('InquiryViewService', () => {
    const service = new InquiryViewService();

    describe('buildListResponse', () => {
        it('limit+1개가 있으면 hasMore=true, items는 limit만큼', () => {
            const result = service.buildListResponse(
                [makeInquiry(), makeInquiry({ id: 'i-2' }), makeInquiry({ id: 'i-3' })],
                2,
                signedUrl,
            );
            expect(result.data).toHaveLength(2);
            expect(result.hasMore).toBe(true);
        });

        it('limit 이하면 hasMore=false', () => {
            const result = service.buildListResponse([makeInquiry()], 5, signedUrl);
            expect(result.hasMore).toBe(false);
        });

        it('latestAnswer가 있으면 마지막 답변을 포함한다', () => {
            const result = service.buildListResponse(
                [
                    makeInquiry({
                        answers: [
                            {
                                id: 'a-1',
                                breederName: '브리더A',
                                content: '답1',
                                answeredAt: new Date(),
                                imageUrls: [],
                                helpfulCount: 0,
                            },
                            {
                                id: 'a-2',
                                breederName: '브리더B',
                                content: '답2',
                                answeredAt: new Date(),
                                imageUrls: [],
                                helpfulCount: 0,
                            },
                        ],
                    }),
                ],
                5,
                signedUrl,
            );
            expect(result.data[0].latestAnswer?.breederName).toBe('브리더B');
        });

        it('답변이 없으면 latestAnswer는 undefined', () => {
            const result = service.buildListResponse([makeInquiry()], 5, signedUrl);
            expect(result.data[0].latestAnswer).toBeUndefined();
        });
    });

    describe('buildDetailResponse', () => {
        it('viewCount를 +1한다', () => {
            const result = service.buildDetailResponse(makeInquiry({ viewCount: 5 }), 'user-1', signedUrl);
            expect(result.viewCount).toBe(6);
        });

        it('빈 imageUrls를 필터링한다', () => {
            const result = service.buildDetailResponse(
                makeInquiry({ imageUrls: ['', '  ', 'ok.jpg'] }),
                undefined,
                signedUrl,
            );
            expect(result.imageUrls).toHaveLength(1);
            expect(result.imageUrls[0]).toContain('ok.jpg');
        });

        it('currentUserHasAnswered를 판별한다', () => {
            const inquiry = makeInquiry({
                answers: [
                    {
                        id: 'a-1',
                        breederId: 'user-1',
                        breederName: '나',
                        content: 'x',
                        answeredAt: new Date(),
                        imageUrls: [],
                        helpfulCount: 0,
                    },
                ],
            });
            const result = service.buildDetailResponse(inquiry, 'user-1', signedUrl);
            expect(result.currentUserHasAnswered).toBe(true);
        });

        it('userId가 없으면 currentUserHasAnswered는 false', () => {
            const result = service.buildDetailResponse(makeInquiry(), undefined, signedUrl);
            expect(result.currentUserHasAnswered).toBe(false);
        });
    });

    describe('ensureReadableByUser', () => {
        it('general 타입은 누구나 볼 수 있다', () => {
            expect(() => service.ensureReadableByUser(makeInquiry({ type: 'general' }))).not.toThrow();
        });

        it('direct 타입은 작성자 또는 대상 브리더만 볼 수 있다', () => {
            const inquiry = makeInquiry({ type: 'direct', authorId: 'user-1', targetBreederId: 'b-1' });
            expect(() => service.ensureReadableByUser(inquiry, 'user-1')).not.toThrow();
            expect(() => service.ensureReadableByUser(inquiry, 'b-1')).not.toThrow();
        });

        it('direct 타입에서 관계없는 사용자는 예외를 던진다', () => {
            const inquiry = makeInquiry({ type: 'direct', authorId: 'user-1', targetBreederId: 'b-1' });
            expect(() => service.ensureReadableByUser(inquiry, 'other')).toThrow(DomainValidationError);
        });
    });
});

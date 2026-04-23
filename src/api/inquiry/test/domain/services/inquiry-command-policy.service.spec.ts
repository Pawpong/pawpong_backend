import { DomainValidationError } from '../../../../../common/error/domain.error';
import { InquiryCommandPolicyService } from '../../../domain/services/inquiry-command-policy.service';

const baseInquiry = {
    id: 'i-1',
    authorId: 'user-1',
    answerCount: 0,
    status: 'open',
    type: 'direct',
    targetBreederId: 'b-1',
} as any;

describe('InquiryCommandPolicyService', () => {
    const policy = new InquiryCommandPolicyService();

    describe('ensureTargetBreederId', () => {
        it('값이 있으면 통과한다', () => {
            expect(() => policy.ensureTargetBreederId('b-1')).not.toThrow();
        });

        it('없으면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureTargetBreederId(undefined)).toThrow(DomainValidationError);
        });
    });

    describe('ensureAuthorOwnsInquiry', () => {
        it('authorId가 일치하면 통과한다', () => {
            expect(() => policy.ensureAuthorOwnsInquiry(baseInquiry, 'user-1', 'denied')).not.toThrow();
        });

        it('다르면 예외를 던진다', () => {
            expect(() => policy.ensureAuthorOwnsInquiry(baseInquiry, 'other', 'denied')).toThrow(DomainValidationError);
        });
    });

    describe('ensureNoAnswers', () => {
        it('answerCount가 0이면 통과한다', () => {
            expect(() => policy.ensureNoAnswers(baseInquiry, 'has answers')).not.toThrow();
        });

        it('1 이상이면 예외를 던진다', () => {
            expect(() => policy.ensureNoAnswers({ ...baseInquiry, answerCount: 1 }, 'has answers')).toThrow(
                DomainValidationError,
            );
        });
    });

    describe('ensureInquiryAnswerable', () => {
        it('closed 상태면 예외를 던진다', () => {
            expect(() => policy.ensureInquiryAnswerable({ ...baseInquiry, status: 'closed' }, 'b-1')).toThrow('종료된');
        });

        it('direct 타입에서 targetBreederId가 다르면 예외를 던진다', () => {
            expect(() => policy.ensureInquiryAnswerable(baseInquiry, 'other-breeder')).toThrow('권한이 없습니다');
        });

        it('direct 타입이고 targetBreederId가 일치하면 통과한다', () => {
            expect(() => policy.ensureInquiryAnswerable(baseInquiry, 'b-1')).not.toThrow();
        });

        it('general 타입은 누구나 답변 가능하다', () => {
            expect(() =>
                policy.ensureInquiryAnswerable({ ...baseInquiry, type: 'general' }, 'any-breeder'),
            ).not.toThrow();
        });
    });

    describe('buildAnswerData', () => {
        it('답변 데이터를 구성한다', () => {
            const result = policy.buildAnswerData(
                'b-1',
                { name: '브리더A', profileImageFileName: 'p.jpg', petType: 'dog', breeds: ['푸들'] } as any,
                { content: '답변 내용', imageUrls: ['i1.jpg'] } as any,
            );
            expect(result.breederName).toBe('브리더A');
            expect(result.animalTypeName).toBe('강아지');
            expect(result.breed).toBe('푸들');
            expect(result.imageUrls).toEqual(['i1.jpg']);
            expect(result.helpfulCount).toBe(0);
        });

        it('cat 타입은 고양이로 매핑한다', () => {
            const result = policy.buildAnswerData('b-1', { name: 'X', petType: 'cat' } as any, { content: 'c' } as any);
            expect(result.animalTypeName).toBe('고양이');
        });

        it('imageUrls가 없으면 빈 배열', () => {
            const result = policy.buildAnswerData('b-1', { name: 'X' } as any, { content: 'c' } as any);
            expect(result.imageUrls).toEqual([]);
        });
    });
});

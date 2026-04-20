import { FeedTagNormalizerService } from '../../../domain/services/feed-tag-normalizer.service';

describe('FeedTagNormalizerService', () => {
    const service = new FeedTagNormalizerService();

    it('앞뒤 공백을 제거한다', () => {
        expect(service.normalizeTag('  강아지  ')).toBe('강아지');
    });

    it('# 접두사를 제거한다', () => {
        expect(service.normalizeTag('#강아지')).toBe('강아지');
    });

    it('# 제거 후 추가 공백도 제거한다', () => {
        expect(service.normalizeTag('# 강아지 ')).toBe('강아지');
    });

    it('영문은 소문자로 변환한다', () => {
        expect(service.normalizeTag('#DOG')).toBe('dog');
    });

    it('빈 문자열은 빈 문자열로 반환한다', () => {
        expect(service.normalizeTag('')).toBe('');
        expect(service.normalizeTag('   ')).toBe('');
        expect(service.normalizeTag('#')).toBe('');
    });

    it('중간 # 은 제거하지 않는다', () => {
        expect(service.normalizeTag('강아지#ABC')).toBe('강아지#abc');
    });
});

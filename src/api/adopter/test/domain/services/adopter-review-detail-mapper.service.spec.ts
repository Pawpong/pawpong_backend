import { AdopterReviewDetailMapperService } from '../../../domain/services/adopter-review-detail-mapper.service';

describe('입양자 후기 상세 매퍼', () => {
    const service = new AdopterReviewDetailMapperService();

    it('후기 상세 레코드를 응답 결과로 변환한다', () => {
        const result = service.toResult({
            reviewId: 'review-id',
            breederNickname: null,
            breederProfileImageFileName: 'profile.jpg',
            breederLevel: null,
            breedingPetType: null,
            content: '후기 내용',
            reviewType: 'positive',
            writtenAt: new Date('2026-04-11T00:00:00.000Z'),
            isVisible: true,
        });

        expect(result).toEqual({
            reviewId: 'review-id',
            breederNickname: '알 수 없음',
            breederProfileImage: 'profile.jpg',
            breederLevel: 'new',
            breedingPetType: 'unknown',
            content: '후기 내용',
            reviewType: 'positive',
            writtenAt: new Date('2026-04-11T00:00:00.000Z'),
            isVisible: true,
        });
    });
});

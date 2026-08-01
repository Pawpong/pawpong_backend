import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';
import { AdopterReviewPageAssemblerService } from '../../../domain/services/adopter-review-page-assembler.service';

describe('입양자 후기 페이지 assembler', () => {
    const service = new AdopterReviewPageAssemblerService(new AdopterPaginationAssemblerService());

    it('후기 목록을 페이지 결과로 조립한다', () => {
        const result = service.build(
            [
                {
                    reviewId: 'review-id',
                    applicationId: 'application-id',
                    breederId: 'breeder-id',
                    breederNickname: null,
                    breederProfileImageFileName: 'profile.jpg',
                    breederLevel: null,
                    breedingPetType: null,
                    content: '후기 내용',
                    reviewType: 'positive',
                    writtenAt: new Date('2026-04-11T00:00:00.000Z'),
                },
            ],
            2,
            10,
            11,
        );

        expect(result.pagination.currentPage).toBe(2);
        expect(result.pagination.totalItems).toBe(11);
        expect(result.items).toEqual([
            {
                reviewId: 'review-id',
                applicationId: 'application-id',
                breederId: 'breeder-id',
                breederNickname: '알 수 없음',
                breederProfileImage: 'profile.jpg',
                breederLevel: 'new',
                breedingPetType: 'unknown',
                content: '후기 내용',
                reviewType: 'positive',
                writtenAt: new Date('2026-04-11T00:00:00.000Z'),
            },
        ]);
    });
});

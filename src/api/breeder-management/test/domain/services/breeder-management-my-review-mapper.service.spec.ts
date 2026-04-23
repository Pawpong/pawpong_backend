import { BreederManagementMyReviewMapperService } from '../../../domain/services/breeder-management-my-review-mapper.service';

describe('BreederManagementMyReviewMapperService', () => {
    const service = new BreederManagementMyReviewMapperService();

    it('adopter name > nickname > 익명 순으로 결정한다', () => {
        const r1 = service.toItem({
            _id: 'r-1',
            adopterId: { _id: 'a-1', name: '이름' },
            content: 'c',
            writtenAt: new Date(),
            isVisible: true,
        } as any);
        expect(r1.adopterName).toBe('이름');
        const r2 = service.toItem({
            _id: 'r-1',
            adopterId: { _id: 'a-1', nickname: '닉' },
            content: 'c',
            writtenAt: new Date(),
            isVisible: true,
        } as any);
        expect(r2.adopterName).toBe('닉');
        const r3 = service.toItem({ _id: 'r-1', content: 'c', writtenAt: new Date(), isVisible: true } as any);
        expect(r3.adopterName).toBe('익명');
    });

    it('isReported이면 reportCount=1, 아니면 0', () => {
        const r1 = service.toItem({
            _id: 'r-1',
            content: 'c',
            writtenAt: new Date(),
            isVisible: true,
            isReported: true,
        } as any);
        expect(r1.reportCount).toBe(1);
        const r2 = service.toItem({
            _id: 'r-1',
            content: 'c',
            writtenAt: new Date(),
            isVisible: true,
            isReported: false,
        } as any);
        expect(r2.reportCount).toBe(0);
    });

    it('type이 없으면 consultation이 기본값', () => {
        const result = service.toItem({ _id: 'r-1', content: 'c', writtenAt: new Date(), isVisible: true } as any);
        expect(result.type).toBe('consultation');
    });
});

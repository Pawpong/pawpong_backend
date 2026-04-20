import { AdopterApplicationListAssemblerService } from '../../../domain/services/adopter-application-list-assembler.service';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';

const fileUrlPort = {
    generateOne: jest.fn(),
    generateOneSafe: jest.fn().mockReturnValue('https://signed.example.com/img.png'),
    generateMany: jest.fn(),
} as any;

describe('AdopterApplicationListAssemblerService', () => {
    const service = new AdopterApplicationListAssemblerService(new AdopterPaginationAssemblerService());

    it('빈 응답을 구성한다', () => {
        const result = service.toEmptyResponse(1, 10);
        expect(result.items).toEqual([]);
        expect(result.pagination.totalItems).toBe(0);
    });

    it('아이템을 매핑한다 (breeder 있음)', () => {
        const application = {
            _id: { toString: () => 'app-1' },
            breederId: { toString: () => 'b-1' },
            adopterId: 'a-1',
            petId: { toString: () => 'p-1' },
            petName: '초코',
            status: 'pending',
            appliedAt: new Date('2026-01-05T00:00:00.000Z'),
            customResponses: [],
        } as any;
        const breeder = {
            nickname: '닉',
            profileImageFileName: 'p.png',
            verification: { level: 'elite' },
            profile: { specialization: ['cat'] },
        } as any;

        const result = service.toItem(application, breeder, fileUrlPort);
        expect(result.breederName).toBe('닉');
        expect(result.breederLevel).toBe('elite');
        expect(result.profileImage).toBe('https://signed.example.com/img.png');
        expect(result.animalType).toBe('cat');
        expect(result.applicationDate).toBe('2026. 01. 05.');
    });

    it('breeder가 없으면 기본값을 사용한다', () => {
        const application = {
            _id: { toString: () => 'app-1' },
            breederId: { toString: () => 'b-1' },
            status: 'pending',
            appliedAt: new Date('2026-01-01'),
        } as any;
        const result = service.toItem(application, null, fileUrlPort);
        expect(result.breederName).toBe('알 수 없음');
        expect(result.breederLevel).toBe('new');
        expect(result.profileImage).toBeNull();
        expect(result.animalType).toBe('dog');
    });

    it('페이지네이션 응답을 구성한다', () => {
        const result = service.toPaginatedResponse([{ applicationId: 'app-1' } as any], 1, 10, 1);
        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
    });
});

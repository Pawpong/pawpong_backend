import { BreederPublicParentPetListAssemblerService } from '../../../domain/services/breeder-public-parent-pet-list-assembler.service';

const fileUrlPort = {
    generateOne: jest.fn(),
    generateOneSafe: jest.fn().mockImplementation((f?: string) => (f ? `https://cdn/${f}` : '')),
    generateMany: jest.fn().mockImplementation((arr: string[]) => arr.map((f) => `https://cdn/${f}`)),
} as any;

function makePet(id: string): any {
    return {
        _id: { toString: () => id },
        name: `pet-${id}`,
        breed: '푸들',
        gender: 'M',
        birthDate: new Date('2024-01-01'),
        photoFileName: `main-${id}.jpg`,
        photos: [`p1-${id}.jpg`],
        healthRecords: [],
    };
}

describe('BreederPublicParentPetListAssemblerService', () => {
    const service = new BreederPublicParentPetListAssemblerService();

    it('limit가 없으면 전체 반환하고 pagination은 undefined', () => {
        const result = service.build([makePet('p1'), makePet('p2')], 1, undefined, fileUrlPort);
        expect(result.items).toHaveLength(2);
        expect(result.pagination).toBeUndefined();
    });

    it('page/limit으로 페이징한다', () => {
        const pets = [makePet('p1'), makePet('p2'), makePet('p3')];
        const result = service.build(pets, 1, 2, fileUrlPort);
        expect(result.items).toHaveLength(2);
        expect(result.pagination?.totalCount).toBe(3);
        expect(result.pagination?.totalPages).toBe(2);
        expect(result.pagination?.hasNextPage).toBe(true);
    });

    it('마지막 페이지에서 hasNextPage=false', () => {
        const pets = [makePet('p1'), makePet('p2'), makePet('p3')];
        const result = service.build(pets, 2, 2, fileUrlPort);
        expect(result.items).toHaveLength(1);
        expect(result.pagination?.hasNextPage).toBe(false);
        expect(result.pagination?.hasPrevPage).toBe(true);
    });

    it('photoFileName 없으면 빈 문자열', () => {
        const pet = { ...makePet('p1'), photoFileName: undefined };
        const result = service.build([pet], 1, undefined, fileUrlPort);
        expect(result.items[0].photoUrl).toBe('');
    });
});

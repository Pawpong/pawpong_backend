import { BreederPublicPetPageAssemblerService } from '../../../domain/services/breeder-public-pet-page-assembler.service';
import { BreederBirthDateFormatterService } from '../../../domain/services/breeder-birth-date-formatter.service';
import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';

const fileUrlPort = {
    generateOne: jest.fn(),
    generateOneSafe: jest.fn().mockReturnValue(''),
    generateMany: jest.fn().mockImplementation((arr: string[]) => arr.map((f) => `https://cdn/${f}`)),
} as any;

function makePet(overrides: any = {}): any {
    return {
        _id: { toString: () => 'p-1' },
        name: '초코',
        breed: '푸들',
        gender: 'M',
        birthDate: new Date('2024-01-01'),
        price: 300000,
        status: 'available',
        photos: ['p.jpg'],
        vaccinations: ['vac'],
        microchipNumber: 'chip',
        ...overrides,
    };
}

describe('BreederPublicPetPageAssemblerService', () => {
    const service = new BreederPublicPetPageAssemblerService(
        new BreederBirthDateFormatterService(),
        new BreederPaginationAssemblerService(),
    );

    it('상태별 집계 값을 반환한다', () => {
        const pets = [
            makePet({ status: 'available' }),
            makePet({ status: 'available' }),
            makePet({ status: 'reserved' }),
            makePet({ status: 'adopted' }),
        ];
        const result = service.build(pets, undefined, 1, 10, fileUrlPort);
        expect(result.availableCount).toBe(2);
        expect(result.reservedCount).toBe(1);
        expect(result.adoptedCount).toBe(1);
    });

    it('status 필터가 있으면 해당 상태만 포함', () => {
        const pets = [makePet({ status: 'available' }), makePet({ status: 'adopted' })];
        const result = service.build(pets, 'adopted', 1, 10, fileUrlPort);
        expect(result.items).toHaveLength(1);
    });

    it('vaccinations가 있으면 isVaccinated=true, microchipNumber가 있으면 hasMicrochip=true', () => {
        const result = service.build([makePet()], undefined, 1, 10, fileUrlPort);
        expect(result.items[0].isVaccinated).toBe(true);
        expect(result.items[0].hasMicrochip).toBe(true);
    });

    it('parents 정보가 있으면 mother/father 카드를 구성한다', () => {
        const pet = makePet({
            parentInfo: {
                mother: {
                    _id: { toString: () => 'm-1' },
                    name: '엄마',
                    breed: '푸들',
                    gender: 'F',
                    birthDate: new Date('2020-01-01'),
                    photos: ['m.jpg'],
                },
                father: {
                    _id: { toString: () => 'f-1' },
                    name: '아빠',
                    breed: '푸들',
                    gender: 'M',
                    birthDate: new Date('2020-01-01'),
                    photos: [],
                },
            },
        });
        const result = service.build([pet], undefined, 1, 10, fileUrlPort);
        expect(result.items[0].parents).toHaveLength(2);
        expect(result.items[0].parents[0].id).toBe('m-1');
    });
});

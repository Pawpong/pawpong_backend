import { BreederPetPostingMapperService } from '../../../domain/services/breeder-pet-posting-mapper.service';
import type { BreederPetPostingCreateCommand } from '../../../application/types/breeder-pet-posting-command.type';

const command: BreederPetPostingCreateCommand = {
    name: '레오파드게코',
    breed: '레오파드게코',
    gender: 'female',
    birthDate: '2024-11-05',
    price: 200000,
    description: '귀여운 파이리',
    photos: ['p/1.jpg', 'p/2.jpg'],
    representativePhotoIndex: 1,
    petType: 'reptile',
    vaccinationStatus: 'completed',
    vaccinationRecords: [{ name: '종합백신', date: '2024-12-01', round: 1 }],
    geneticTestStatus: 'incomplete',
    geneticTestIncompleteReason: '  검사 예정  ',
    parentPetSnapshots: [{ relation: 'mother', breed: '레오파드게코', name: '마망', birthDate: '2020-04-10' }],
    breedingEnvironment: { description: '  온도 조절 사육장  ', photoFileName: 'env.jpg' },
};

describe('BreederPetPostingMapperService', () => {
    const mapper = new BreederPetPostingMapperService();

    it('vaccination completed → records 보존, incompleteReason 제거', () => {
        const data = mapper.toPersistData('breeder-1', { ...command });
        expect(data.vaccinationStatus).toBe('completed');
        expect(data.vaccinationRecords).toHaveLength(1);
        expect(data.vaccinationRecords[0].date).toBeInstanceOf(Date);
        expect(data.vaccinationIncompleteReason).toBeUndefined();
    });

    it('vaccination incomplete → records 비우고 reason trim 보존', () => {
        const data = mapper.toPersistData('breeder-1', {
            ...command,
            vaccinationStatus: 'incomplete',
            vaccinationRecords: [{ name: '버려질 기록', date: '2024-12-01', round: 1 }],
            vaccinationIncompleteReason: '  태어난지 한달도 안됨  ',
        });
        expect(data.vaccinationRecords).toEqual([]);
        expect(data.vaccinationIncompleteReason).toBe('태어난지 한달도 안됨');
    });

    it('geneticTest incomplete → reason trim 보존', () => {
        const data = mapper.toPersistData('breeder-1', { ...command });
        expect(data.geneticTestStatus).toBe('incomplete');
        expect(data.geneticTestRecords).toEqual([]);
        expect(data.geneticTestIncompleteReason).toBe('검사 예정');
    });

    it('breedingEnvironment description trim, 빈 객체면 undefined', () => {
        const data = mapper.toPersistData('breeder-1', { ...command });
        expect(data.breedingEnvironment?.description).toBe('온도 조절 사육장');
        expect(data.breedingEnvironment?.photoFileName).toBe('env.jpg');

        const empty = mapper.toPersistData('breeder-1', {
            ...command,
            breedingEnvironment: { description: '   ', photoFileName: '' },
        });
        expect(empty.breedingEnvironment).toBeUndefined();
    });

    it('representativePhotoIndex 미지정 시 기본값 0', () => {
        const data = mapper.toPersistData('breeder-1', { ...command, representativePhotoIndex: undefined });
        expect(data.representativePhotoIndex).toBe(0);
    });

    it('parentPetSnapshots 의 birthDate 는 Date 로 변환된다', () => {
        const data = mapper.toPersistData('breeder-1', { ...command });
        expect(data.parentPetSnapshots[0].birthDate).toBeInstanceOf(Date);
    });

    it('persist data 의 status/isActive 기본값', () => {
        const data = mapper.toPersistData('breeder-1', { ...command });
        expect(data.status).toBe('available');
        expect(data.isActive).toBe(true);
        expect(data.breederId).toBe('breeder-1');
    });
});

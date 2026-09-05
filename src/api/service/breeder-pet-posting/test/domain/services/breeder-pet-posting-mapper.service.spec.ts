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

    it('breedingEnvironment 레거시 단일 photoFileName 은 배열로 승격된다', () => {
        const data = mapper.toPersistData('breeder-1', { ...command });
        expect(data.breedingEnvironment?.photoFileNames).toEqual(['env.jpg']);
    });

    it('breedingEnvironment photoFileNames 배열이 단일 필드보다 우선하고 첫 장이 photoFileName 에 실린다', () => {
        const data = mapper.toPersistData('breeder-1', {
            ...command,
            breedingEnvironment: {
                description: '사육장',
                photoFileName: 'legacy.jpg',
                photoFileNames: ['env-1.jpg', ' env-2.jpg ', 'env-1.jpg', ''],
            },
        });
        // trim + 중복/빈 값 제거, legacy 단일 필드는 무시
        expect(data.breedingEnvironment?.photoFileNames).toEqual(['env-1.jpg', 'env-2.jpg']);
        // 하위 호환 소비자를 위해 첫 장이 단일 필드로도 저장된다
        expect(data.breedingEnvironment?.photoFileName).toBe('env-1.jpg');
    });

    it('breedingEnvironment 사진이 5장을 넘으면 5장까지만 저장한다', () => {
        const data = mapper.toPersistData('breeder-1', {
            ...command,
            breedingEnvironment: {
                photoFileNames: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'],
            },
        });
        expect(data.breedingEnvironment?.photoFileNames).toHaveLength(5);
        expect(data.breedingEnvironment?.photoFileNames).not.toContain('6.jpg');
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

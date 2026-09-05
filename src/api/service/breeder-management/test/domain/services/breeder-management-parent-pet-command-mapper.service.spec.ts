import { BreederManagementParentPetCommandMapperService } from '../../../domain/services/breeder-management-parent-pet-command-mapper.service';

describe('BreederManagementParentPetCommandMapperService', () => {
    const service = new BreederManagementParentPetCommandMapperService();

    it('create: breederId=userId, isActive=true, 기본값 적용', () => {
        const result = service.toCreateData('u-1', {
            name: '엄마',
            breed: '푸들',
            gender: 'F',
            birthDate: '2020-01-01',
        } as any);
        expect(result.breederId).toBe('u-1');
        expect(result.isActive).toBe(true);
        expect(result.photos).toEqual([]);
        expect(result.description).toBe('');
        expect(result.birthDate).toBeInstanceOf(Date);
    });

    it('update: undefined는 제외', () => {
        const result = service.toUpdateData({ name: '이름' } as any);
        expect(result).toEqual({ name: '이름' });
    });

    it('update: description 빈 문자열도 포함', () => {
        const result = service.toUpdateData({ description: '' } as any);
        expect(result.description).toBe('');
    });
});

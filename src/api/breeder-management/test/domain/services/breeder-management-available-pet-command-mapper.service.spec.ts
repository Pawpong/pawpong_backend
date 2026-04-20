import { PetStatus } from '../../../../../common/enum/user.enum';
import { BreederManagementAvailablePetCommandMapperService } from '../../../domain/services/breeder-management-available-pet-command-mapper.service';

describe('BreederManagementAvailablePetCommandMapperService', () => {
    const service = new BreederManagementAvailablePetCommandMapperService();

    describe('toCreateData', () => {
        it('status=AVAILABLE과 기본값을 설정한다', () => {
            const result = service.toCreateData('u-1', {
                name: '초코',
                breed: '푸들',
                gender: 'M',
                birthDate: '2024-01-01',
                price: 300000,
            } as any);
            expect(result.breederId).toBe('u-1');
            expect(result.status).toBe(PetStatus.AVAILABLE);
            expect(result.photos).toEqual([]);
            expect(result.description).toBe('');
            expect(result.parentInfo).toBeUndefined();
            expect(result.birthDate).toBeInstanceOf(Date);
        });

        it('parentInfo가 있으면 mother/father를 포함', () => {
            const result = service.toCreateData('u-1', {
                name: '초코',
                breed: '푸들',
                gender: 'M',
                birthDate: '2024-01-01',
                price: 0,
                parentInfo: { mother: 'm-1', father: 'f-1' },
            } as any);
            expect(result.parentInfo).toEqual({ mother: 'm-1', father: 'f-1' });
        });
    });

    describe('toUpdateData', () => {
        it('undefined 필드는 제외한다', () => {
            const result = service.toUpdateData({ name: '초코' } as any);
            expect(result).toEqual({ name: '초코' });
        });

        it('description이 빈 문자열이어도 포함한다', () => {
            const result = service.toUpdateData({ description: '' } as any);
            expect(result.description).toBe('');
        });

        it('birthDate는 Date로 변환', () => {
            const result = service.toUpdateData({ birthDate: '2024-01-01' } as any);
            expect(result.birthDate).toBeInstanceOf(Date);
        });
    });
});

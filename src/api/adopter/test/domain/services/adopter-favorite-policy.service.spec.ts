import { DomainConflictError, DomainValidationError } from '../../../../../common/error/domain.error';
import { AdopterFavoritePolicyService } from '../../../domain/services/adopter-favorite-policy.service';

const existingFavorite = { favoriteBreederId: 'b-1', breederName: '브리더A', addedAt: new Date() } as any;

describe('AdopterFavoritePolicyService', () => {
    const policy = new AdopterFavoritePolicyService();

    describe('ensureCanAdd', () => {
        it('없으면 통과한다', () => {
            expect(() => policy.ensureCanAdd([], 'b-1')).not.toThrow();
        });
        it('이미 있으면 DomainConflictError', () => {
            expect(() => policy.ensureCanAdd([existingFavorite], 'b-1')).toThrow(DomainConflictError);
        });
    });

    describe('ensureCanRemove', () => {
        it('있으면 통과', () => {
            expect(() => policy.ensureCanRemove([existingFavorite], 'b-1')).not.toThrow();
        });
        it('없으면 DomainValidationError', () => {
            expect(() => policy.ensureCanRemove([], 'b-1')).toThrow(DomainValidationError);
        });
    });
});

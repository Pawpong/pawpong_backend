import { BadRequestException } from '@nestjs/common';

import { AdminPushTargetValidatorService } from '../../../domain/services/admin-push-target-validator.service';

describe('AdminPushTargetValidatorService', () => {
    const validator = new AdminPushTargetValidatorService();

    it('all_adopters / all_breeders 는 그대로 통과', () => {
        expect(() => validator.validate({ type: 'all_adopters' })).not.toThrow();
        expect(() => validator.validate({ type: 'all_breeders' })).not.toThrow();
    });

    it('individual + 정상 입력은 통과', () => {
        expect(() =>
            validator.validate({ type: 'individual', role: 'adopter', userId: '507f1f77bcf86cd799439011' }),
        ).not.toThrow();
        expect(() =>
            validator.validate({ type: 'individual', role: 'breeder', userId: '507f1f77bcf86cd799439022' }),
        ).not.toThrow();
    });

    it('individual + userId 비어있으면 BadRequest', () => {
        expect(() =>
            validator.validate({ type: 'individual', role: 'adopter', userId: '   ' } as any),
        ).toThrow(BadRequestException);
        expect(() =>
            validator.validate({ type: 'individual', role: 'adopter', userId: '' } as any),
        ).toThrow(BadRequestException);
    });

    it('individual + 잘못된 role → BadRequest', () => {
        expect(() =>
            validator.validate({ type: 'individual', role: 'admin', userId: '507f1f77bcf86cd799439011' } as any),
        ).toThrow(BadRequestException);
    });

    it('지원하지 않는 type → BadRequest', () => {
        expect(() => validator.validate({ type: 'unknown' } as any)).toThrow(BadRequestException);
    });
});

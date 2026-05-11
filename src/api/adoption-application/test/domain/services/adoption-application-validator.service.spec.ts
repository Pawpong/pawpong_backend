import { BadRequestException } from '@nestjs/common';

import { AdoptionApplicationValidatorService } from '../../../domain/services/adoption-application-validator.service';
import type { CreateAdoptionApplicationV2Command } from '../../../application/types/adoption-application.type';

const validCommand = (): CreateAdoptionApplicationV2Command => ({
    adopterId: 'a-1',
    petId: 'p-1',
    adoptionPlan: '주택에서 생활합니다',
    familyMembers: '배우자 1명',
    privacyConsent: true,
    basicCareConsent: true,
    emergencyCareConsent: true,
    allFamilyConsent: true,
});

describe('AdoptionApplicationValidatorService', () => {
    const validator = new AdoptionApplicationValidatorService();

    it('정상 입력은 통과', () => {
        expect(() => validator.validate(validCommand())).not.toThrow();
    });

    it.each([
        ['privacyConsent', { privacyConsent: false }],
        ['basicCareConsent', { basicCareConsent: false }],
        ['emergencyCareConsent', { emergencyCareConsent: false }],
        ['allFamilyConsent', { allFamilyConsent: false }],
    ])('%s 가 false 면 BadRequest', (_field, override) => {
        expect(() => validator.validate({ ...validCommand(), ...override })).toThrow(BadRequestException);
    });

    it('adoptionPlan 이 공백만이면 BadRequest', () => {
        expect(() => validator.validate({ ...validCommand(), adoptionPlan: '   ' })).toThrow(BadRequestException);
    });

    it('familyMembers 가 빈 문자열이면 BadRequest', () => {
        expect(() => validator.validate({ ...validCommand(), familyMembers: '' })).toThrow(BadRequestException);
    });
});

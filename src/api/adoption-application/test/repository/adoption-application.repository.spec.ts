import { ConflictException } from '@nestjs/common';

import { AdoptionApplicationRepository } from '../../repository/adoption-application.repository';

describe('AdoptionApplicationRepository — stale index 방어층', () => {
    function buildRepository(applicationModel: any) {
        return new AdoptionApplicationRepository(applicationModel as any, {} as any, {} as any);
    }

    it('create() 가 E11000 을 ConflictException 으로 흡수 (stale unique 인덱스 잔존 대응)', async () => {
        const duplicateKeyError = Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
        const applicationModel = { create: jest.fn().mockRejectedValueOnce(duplicateKeyError) };
        const repo = buildRepository(applicationModel);
        await expect(
            repo.create({
                breederId: '507f1f77bcf86cd799439011',
                adopterId: '507f1f77bcf86cd799439022',
                petId: '507f1f77bcf86cd799439033',
                petName: 'p',
                status: 'consultation_pending',
                standardResponses: {
                    privacyConsent: true,
                    familyMembers: '본인',
                    allFamilyConsent: true,
                    canProvideBasicCare: true,
                    canAffordMedicalExpenses: true,
                    adoptionPlan: '계획',
                },
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('create() 가 11000 이 아닌 에러는 그대로 전파한다', async () => {
        const otherError = new Error('connection lost');
        const applicationModel = { create: jest.fn().mockRejectedValueOnce(otherError) };
        const repo = buildRepository(applicationModel);
        await expect(
            repo.create({
                breederId: '507f1f77bcf86cd799439011',
                adopterId: '507f1f77bcf86cd799439022',
                petId: '507f1f77bcf86cd799439033',
                petName: 'p',
                status: 'consultation_pending',
                standardResponses: {
                    privacyConsent: true,
                    familyMembers: '본인',
                    allFamilyConsent: true,
                    canProvideBasicCare: true,
                    canAffordMedicalExpenses: true,
                    adoptionPlan: '계획',
                },
            }),
        ).rejects.toBe(otherError);
    });

    it('onModuleInit — stale 인덱스가 없으면(index not found) 조용히 통과', async () => {
        const dropIndex = jest.fn().mockRejectedValueOnce(new Error('index not found with name [foo]'));
        const applicationModel = { collection: { dropIndex } };
        const repo = buildRepository(applicationModel);
        await expect(repo.onModuleInit()).resolves.toBeUndefined();
        expect(dropIndex).toHaveBeenCalledWith('uniq_adopter_pet_open_application_v2');
    });

    it('onModuleInit — stale 인덱스가 있으면 명시적으로 drop', async () => {
        const dropIndex = jest.fn().mockResolvedValueOnce({ ok: 1 });
        const applicationModel = { collection: { dropIndex } };
        const repo = buildRepository(applicationModel);
        await repo.onModuleInit();
        expect(dropIndex).toHaveBeenCalledWith('uniq_adopter_pet_open_application_v2');
    });
});

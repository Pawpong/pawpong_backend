import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
    readBreederManagementPetStatus,
    seedBreederManagementApplicationForPet,
    seedBreederManagementPet,
} from '../fixtures/breeder-management.e2e.fixture';

/**
 * 상담완료 ↔ 펫 예약중 연동 종단간 테스트.
 *
 * 상담완료는 브리더가 "이 사람으로 진행한다"고 정하는 확정 직전 단계이므로 펫을 예약중으로 잠가
 * 다른 사람의 신규 신청을 막는다. 잠그기만 하고 푸는 길이 없으면 거절 후 펫이 영영 묶이므로,
 * 해제 경로와 "상담완료가 아직 남은 경우 유지" 까지 함께 검증한다.
 */
describe('브리더 관리 펫 예약 상태 연동 종단간 테스트', () => {
    let context: BreederManagementE2eContext;

    beforeAll(async () => {
        context = await createBreederManagementE2eContext();
    });

    afterAll(async () => {
        await closeBreederManagementE2eContext(context);
    });

    const patchStatus = (applicationId: string, status: string) =>
        request(context.app.getHttpServer())
            .patch(`/api/v2/breeder-management/applications/${applicationId}`)
            .set('Authorization', `Bearer ${context.breederToken}`)
            .send({ applicationId, status })
            .expect(200);

    it('상담완료로 바꾸면 펫이 예약중이 된다', async () => {
        const petId = await seedBreederManagementPet(context);
        const applicationId = await seedBreederManagementApplicationForPet(context, petId);

        expect(await readBreederManagementPetStatus(context, petId)).toBe('available');

        await patchStatus(applicationId, 'consultation_completed');

        expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');
    });

    it('예약중인 펫에는 신규 입양 신청을 넣을 수 없다', async () => {
        const petId = await seedBreederManagementPet(context);
        const applicationId = await seedBreederManagementApplicationForPet(context, petId);

        await patchStatus(applicationId, 'consultation_completed');
        expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');

        await request(context.app.getHttpServer())
            .post('/api/v2/adoption-application')
            .set('Authorization', `Bearer ${context.adopterToken}`)
            .send({ petId, standardResponses: { privacyConsent: true } })
            .expect(400);
    });

    it('마지막 상담완료 신청을 거절하면 펫이 다시 분양중으로 풀린다', async () => {
        const petId = await seedBreederManagementPet(context);
        const applicationId = await seedBreederManagementApplicationForPet(context, petId);

        await patchStatus(applicationId, 'consultation_completed');
        expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');

        await patchStatus(applicationId, 'adoption_rejected');

        expect(await readBreederManagementPetStatus(context, petId)).toBe('available');
    });

    it('상담완료 신청이 아직 남아 있으면 한 건을 거절해도 예약중을 유지한다', async () => {
        const petId = await seedBreederManagementPet(context);
        const firstId = await seedBreederManagementApplicationForPet(context, petId);
        const secondId = await seedBreederManagementApplicationForPet(context, petId);

        await patchStatus(firstId, 'consultation_completed');
        await patchStatus(secondId, 'consultation_completed');
        expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');

        await patchStatus(firstId, 'adoption_rejected');
        expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');

        await patchStatus(secondId, 'adoption_rejected');
        expect(await readBreederManagementPetStatus(context, petId)).toBe('available');
    });

    it('입양을 확정하면 예약중이 아니라 분양완료가 되고, 예약 동기화가 이를 되돌리지 않는다', async () => {
        const petId = await seedBreederManagementPet(context);
        const applicationId = await seedBreederManagementApplicationForPet(context, petId);

        await patchStatus(applicationId, 'consultation_completed');
        expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');

        await patchStatus(applicationId, 'adoption_approved');

        expect(await readBreederManagementPetStatus(context, petId)).toBe('adopted');
    });

    it('상담대기로 두는 동안에는 펫이 분양중 그대로다', async () => {
        const petId = await seedBreederManagementPet(context);
        const applicationId = await seedBreederManagementApplicationForPet(context, petId);

        await patchStatus(applicationId, 'consultation_pending');

        expect(await readBreederManagementPetStatus(context, petId)).toBe('available');
    });
});

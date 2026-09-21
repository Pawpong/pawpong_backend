import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
    readBreederManagementApplicationStatus,
    readBreederManagementNotifications,
    readBreederManagementPetStatus,
    registerBreederManagementExtraAdopter,
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

    const patchStatus = (applicationId: string, status: string, expectedCode = 200) =>
        request(context.app.getHttpServer())
            .patch(`/api/v2/breeder-management/applications/${applicationId}`)
            .set('Authorization', `Bearer ${context.breederToken}`)
            .send({ applicationId, status })
            .expect(expectedCode);

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
    describe('확정 시 자동 거절된 신청자 알림', () => {
        it('같은 펫의 다른 신청자도 거절 알림을 받는다 (예전엔 상태만 조용히 바뀌었다)', async () => {
            const petId = await seedBreederManagementPet(context);
            const { adopterId: otherAdopterId } = await registerBreederManagementExtraAdopter(context);
            const winnerId = await seedBreederManagementApplicationForPet(context, petId);
            const loserId = await seedBreederManagementApplicationForPet(context, petId, otherAdopterId);

            await patchStatus(winnerId, 'consultation_completed');
            await patchStatus(winnerId, 'adoption_approved');

            expect(await readBreederManagementApplicationStatus(context, loserId)).toBe('adoption_rejected');

            const notifications = await readBreederManagementNotifications(
                context,
                otherAdopterId,
                'adoption_rejected',
            );
            expect(notifications).toHaveLength(1);
            // 알림을 눌렀을 때 자기가 '보낸' 신청 상세로 가야 한다 — view 가 없으면 받은 신청 화면으로 샌다.
            expect(notifications[0].targetUrl).toBe(`/activity/applications/${loserId}?view=sent`);
        });

        it('자동 거절 대상이 없으면 확정자 본인 알림만 나간다', async () => {
            const petId = await seedBreederManagementPet(context);
            // 컨텍스트 입양자는 앞선 테스트들의 알림이 쌓여 있어 개수를 셀 수 없다 — 전용 계정을 쓴다.
            const { adopterId } = await registerBreederManagementExtraAdopter(context);
            const applicationId = await seedBreederManagementApplicationForPet(context, petId, adopterId);

            await patchStatus(applicationId, 'consultation_completed');
            await patchStatus(applicationId, 'adoption_approved');

            const rejected = await readBreederManagementNotifications(context, adopterId, 'adoption_rejected');
            expect(rejected).toHaveLength(0);
            const approved = await readBreederManagementNotifications(context, adopterId, 'adoption_approved');
            expect(approved).toHaveLength(1);
        });
    });

    describe('상태 전이 가드', () => {
        it('자동 거절된 신청을 낡은 화면에서 다시 확정할 수 없다 (409)', async () => {
            const petId = await seedBreederManagementPet(context);
            const { adopterId: otherAdopterId } = await registerBreederManagementExtraAdopter(context);
            const winnerId = await seedBreederManagementApplicationForPet(context, petId);
            const loserId = await seedBreederManagementApplicationForPet(context, petId, otherAdopterId);

            await patchStatus(winnerId, 'consultation_completed');
            await patchStatus(loserId, 'consultation_completed');
            await patchStatus(winnerId, 'adoption_approved');

            // 탭에 열어둔 채였다면 화면은 아직 '입양 확정' 버튼을 들고 있다.
            const blocked = await patchStatus(loserId, 'adoption_approved', 409);

            // 프론트가 이 문구를 그대로 빨간 배너에 띄운다 — 왜 막혔는지 화면에서 읽혀야 한다.
            expect(blocked.body.message || blocked.body.error).toContain('진행 종료');

            expect(await readBreederManagementApplicationStatus(context, loserId)).toBe('adoption_rejected');
            expect(await readBreederManagementPetStatus(context, petId)).toBe('adopted');
        });

        it('확정된 신청을 상담완료로 되돌릴 수 없다 (409)', async () => {
            const petId = await seedBreederManagementPet(context);
            const applicationId = await seedBreederManagementApplicationForPet(context, petId);

            await patchStatus(applicationId, 'consultation_completed');
            await patchStatus(applicationId, 'adoption_approved');

            await patchStatus(applicationId, 'consultation_completed', 409);

            expect(await readBreederManagementApplicationStatus(context, applicationId)).toBe('adoption_approved');
            // 되돌리기가 먹혔다면 예약 재계산이 돌아 펫이 예약중으로 풀렸을 것이다.
            expect(await readBreederManagementPetStatus(context, petId)).toBe('adopted');
        });

        it('같은 상태로 다시 눌러도 200 이고 알림이 중복으로 나가지 않는다', async () => {
            const petId = await seedBreederManagementPet(context);
            const { adopterId } = await registerBreederManagementExtraAdopter(context);
            const applicationId = await seedBreederManagementApplicationForPet(context, petId, adopterId);

            await patchStatus(applicationId, 'consultation_completed');
            await patchStatus(applicationId, 'consultation_completed');

            const notifications = await readBreederManagementNotifications(context, adopterId, 'consult_completed');
            expect(notifications).toHaveLength(1);
            expect(await readBreederManagementPetStatus(context, petId)).toBe('reserved');
        });
    });
});

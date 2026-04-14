import { ObjectId } from 'mongodb';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import request from 'supertest';

import {
    BreederManagementE2eContext,
    closeBreederManagementE2eContext,
    createBreederManagementE2eContext,
    seedBreederManagementReview,
} from '../fixtures/breeder-management.e2e.fixture';

describe('브리더 관리 후기와 계정 종단간 테스트', () => {
    let context: BreederManagementE2eContext;

    beforeAll(async () => {
        context = await createBreederManagementE2eContext();
    });

    afterAll(async () => {
        await closeBreederManagementE2eContext(context);
    });

    describe('후기 답글 관리', () => {
        let reviewId: string;

        beforeAll(async () => {
            reviewId = await seedBreederManagementReview(context);
        });

        it('후기 답글을 등록한다', async () => {
            const response = await request(context.app.getHttpServer())
                .post(`/api/breeder-management/reviews/${reviewId}/reply`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    content: '소중한 후기 감사합니다.',
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('답글이 등록되었습니다.');
            expect(response.body.data.reviewId).toBe(reviewId);
            expect(response.body.data.replyContent).toBe('소중한 후기 감사합니다.');
        });

        it('후기 답글을 수정한다', async () => {
            const response = await request(context.app.getHttpServer())
                .patch(`/api/breeder-management/reviews/${reviewId}/reply`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .send({
                    content: '소중한 후기 정말 감사합니다.',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('답글이 수정되었습니다.');
            expect(response.body.data.replyContent).toBe('소중한 후기 정말 감사합니다.');
        });

        it('후기 답글을 삭제한다', async () => {
            const response = await request(context.app.getHttpServer())
                .delete(`/api/breeder-management/reviews/${reviewId}/reply`)
                .set('Authorization', `Bearer ${context.breederToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('답글이 삭제되었습니다.');
            expect(response.body.data.reviewId).toBe(reviewId);
            expect(response.body.data.message).toBe('답글이 삭제되었습니다.');
        });
    });

    describe('계정 탈퇴', () => {
        let deleteBreederToken: string;
        let deleteBreederId: string;

        beforeAll(async () => {
            const timestamp = Date.now();
            const response = await request(context.app.getHttpServer())
                .post('/api/auth/register/breeder')
                .send({
                    email: `breeder_delete_${timestamp}@test.com`,
                    phoneNumber: '010-2222-1111',
                    breederName: '탈퇴 테스트 브리더',
                    breederLocation: {
                        city: '서울특별시',
                        district: '마포구',
                    },
                    animal: 'dog',
                    breeds: ['비숑프리제'],
                    plan: 'basic',
                    level: 'new',
                    agreements: {
                        termsOfService: true,
                        privacyPolicy: true,
                        marketingConsent: false,
                    },
                })
                .expect(200);

            deleteBreederToken = response.body.data.accessToken;
            deleteBreederId = response.body.data.breederId;
        });

        it('브리더 회원 탈퇴를 처리한다', async () => {
            const response = await request(context.app.getHttpServer())
                .delete('/api/breeder-management/account')
                .set('Authorization', `Bearer ${deleteBreederToken}`)
                .send({
                    reason: 'no_inquiry',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('브리더 회원 탈퇴가 성공적으로 처리되었습니다.');
            expect(response.body.data.breederId).toBe(deleteBreederId);
            expect(response.body.data.deletedAt).toBeDefined();

            const connection = context.app.get<Connection>(getConnectionToken());
            const deletedBreeder = await connection
                .collection('breeders')
                .findOne({ _id: new ObjectId(deleteBreederId) });

            expect(deletedBreeder?.accountStatus).toBe('deleted');
            expect(deletedBreeder?.deletedAt).toBeDefined();
            expect(deletedBreeder?.deleteReason).toBe('no_inquiry');
        });
    });
});

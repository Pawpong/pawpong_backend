import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { cleanupDatabase, createTestingApp, seedAdmin } from '../../../../../common/test/test-utils';

describe('사용자 관리자 응답 계약 종단간 테스트', () => {
    let app: INestApplication;
    let adminToken: string;
    let adminId: string;
    let adopterId: string;

    beforeAll(async () => {
        app = await createTestingApp();

        const adminPassword = 'admin1234';
        const { adminId: createdAdminId, email } = await seedAdmin(app, adminPassword);
        adminId = createdAdminId;

        const loginResponse = await request(app.getHttpServer())
            .post('/api/auth-admin/login')
            .send({
                email,
                password: adminPassword,
            })
            .expect(200);

        adminToken = loginResponse.body.data.accessToken;

        const timestamp = Date.now();
        const adopterProviderId = Math.random().toString().slice(2, 12);
        const adopterResponse = await request(app.getHttpServer())
            .post('/api/auth/register/adopter')
            .send({
                tempId: `temp_kakao_${adopterProviderId}_${timestamp}`,
                email: `user_admin_contract_${timestamp}@test.com`,
                nickname: `유저관리계약${timestamp}`,
                phone: '010-2222-3333',
                profileImage: 'https://example.com/user-admin-contract.jpg',
            })
            .expect(200);

        adopterId = adopterResponse.body.data.adopterId;
    });

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/user-admin/profile')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '관리자 프로필이 조회되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                id: adminId,
                name: '테스트관리자',
                email: expect.any(String),
                status: 'active',
                adminLevel: 'super_admin',
                permissions: expect.objectContaining({
                    canManageUsers: true,
                    canManageBreeders: true,
                    canManageReports: true,
                    canViewStatistics: true,
                    canManageAdmins: true,
                }),
                activityLogs: expect.any(Array),
                createdAt: expect.any(String),
            }),
        );
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/user-admin/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .query({ page: 1, limit: 10 })
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '사용자 목록이 조회되었습니다.',
            }),
        );

        expect(response.body.data).toEqual(
            expect.objectContaining({
                items: expect.any(Array),
                pagination: expect.objectContaining({
                    currentPage: 1,
                    pageSize: 10,
                    totalItems: expect.any(Number),
                    totalPages: expect.any(Number),
                    hasNextPage: expect.any(Boolean),
                    hasPrevPage: expect.any(Boolean),
                }),
            }),
        );

        expect(response.body.data.items).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    userId: adopterId,
                    userName: expect.any(String),
                    emailAddress: expect.any(String),
                    userRole: 'adopter',
                    accountStatus: 'active',
                    createdAt: expect.any(String),
                }),
            ]),
        );
    });

    it('응답 계약을 유지한다', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/api/user-admin/users/${adopterId}/status?role=adopter`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                accountStatus: 'suspended',
                actionReason: '계약 테스트 정지',
            })
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                message: '사용자 상태가 변경되었습니다.',
                data: {
                    message: 'adopter status updated to suspended',
                },
            }),
        );
    });
});

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp, cleanupDatabase, getAdopterToken, getBreederToken } from '../../../common/test/test-utils';

/**
 * 채팅 도메인 E2E 테스트
 *
 * 테스트 대상 REST API:
 * 1. POST   /api/chat/rooms              - 채팅방 생성 또는 기존 방 반환 (adopter 전용)
 * 2. GET    /api/chat/rooms              - 내 채팅방 목록 조회
 * 3. GET    /api/chat/rooms/:roomId/messages - 메시지 목록 조회
 * 4. DELETE /api/chat/rooms/:roomId      - 채팅방 닫기
 *
 * 참고:
 * - WebSocket(ChatGateway) 테스트는 이 파일의 범위 밖
 * - KafkaService는 미연결 시 gracefully skip 처리되므로 Kafka 없이도 동작
 * - HttpStatusInterceptor는 main.ts에서만 등록되므로 테스트 환경에서는 미적용.
 *   POST /api/chat/rooms는 @HttpCode(200) 적용으로 200 반환
 * - RolesGuard는 브리더에게 adopter 권한을 부여하나, 채팅 컨트롤러에서 role 직접 검사하여 브리더 차단 (403)
 * - ChatPolicyService: 방 미존재 → NotFoundException(404), 비참가자 → ForbiddenException(403)
 */
describe('Chat API E2E Tests', () => {
    let app: INestApplication;
    let adopterToken: string;
    let adopterId: string;
    let breederToken: string;
    let breederId: string;

    beforeAll(async () => {
        app = await createTestingApp();

        // 입양자 생성
        const adopterResult = await getAdopterToken(app);
        expect(adopterResult).not.toBeNull();
        adopterToken = adopterResult!.token;
        adopterId = adopterResult!.adopterId;

        // 브리더 생성
        const breederResult = await getBreederToken(app);
        expect(breederResult).not.toBeNull();
        breederToken = breederResult!.token;
        breederId = breederResult!.breederId;

        console.log('✅ 테스트 사용자 생성 완료:', { adopterId, breederId });
    });

    afterAll(async () => {
        await cleanupDatabase(app);
        await app.close();
    });

    /**
     * 1. 채팅방 생성 / 기존 방 반환
     */
    describe('POST /api/chat/rooms - 채팅방 생성', () => {
        let roomId: string;

        it('입양자가 채팅방 생성 성공', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId })
                .expect(200); // @HttpCode(200) 적용

            expect(response.body).toBeDefined();
            expect(response.body.id).toBeDefined();
            expect(response.body.adopterId).toBe(adopterId);
            expect(response.body.breederId).toBe(breederId);

            roomId = response.body.id;
            console.log('✅ 채팅방 생성 성공:', roomId);
        });

        it('동일 참가자로 재요청 시 기존 채팅방 반환', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId })
                .expect(200);

            expect(response.body.id).toBe(roomId);
            console.log('✅ 기존 채팅방 반환 확인:', roomId);
        });

        it('applicationId 포함하여 채팅방 생성 성공', async () => {
            // 다른 브리더가 필요하므로 새 브리더 생성
            const anotherBreeder = await getBreederToken(app);
            expect(anotherBreeder).not.toBeNull();

            const response = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({
                    breederId: anotherBreeder!.breederId,
                    applicationId: 'test-application-id',
                })
                .expect(200);

            expect(response.body.id).toBeDefined();
            console.log('✅ applicationId 포함 채팅방 생성 성공');
        });

        it('인증 없이 요청 시 401 반환', async () => {
            await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .send({ breederId })
                .expect(401);

            console.log('✅ 미인증 요청 401 확인');
        });

        it('브리더가 채팅방 생성 시도 시 403 반환 (입양자 → 브리더 단방향 채팅 설계)', async () => {
            // 설계 의도: 채팅방은 입양자만 개설 가능 (adopter → breeder)
            // RolesGuard는 브리더에게 adopter 권한을 부여하지만,
            // 컨트롤러에서 user.role을 직접 검사하여 브리더를 차단함
            await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${breederToken}`)
                .send({ breederId })
                .expect(403);

            console.log('✅ 브리더 채팅방 생성 차단 403 확인');
        });

        it('breederId 없이 요청 시 400 반환', async () => {
            await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({})
                .expect(400);

            console.log('✅ 필수 필드 누락 400 확인');
        });

        it('닫힌 채팅방 이후 재요청 시 새 채팅방 생성', async () => {
            // 닫힌 방(CLOSED)은 findRoomByParticipants에서 status: ACTIVE 필터로 제외됨
            // → 새 채팅방이 생성되어야 함
            const anotherBreeder = await getBreederToken(app);
            expect(anotherBreeder).not.toBeNull();

            // 채팅방 생성
            const createRes = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId: anotherBreeder!.breederId })
                .expect(200);
            const firstRoomId = createRes.body.id;

            // 채팅방 닫기
            await request(app.getHttpServer())
                .delete(`/api/chat/rooms/${firstRoomId}`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            // 같은 브리더로 재요청 → 새 방 생성
            const newRes = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId: anotherBreeder!.breederId })
                .expect(200);

            expect(newRes.body.id).not.toBe(firstRoomId);
            console.log('✅ 닫힌 방 이후 재요청 시 새 채팅방 생성 확인:', newRes.body.id);
        });
    });

    /**
     * 2. 채팅방 목록 조회
     */
    describe('GET /api/chat/rooms - 채팅방 목록', () => {
        beforeAll(async () => {
            // 채팅방이 없으면 하나 생성
            await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId });
        });

        it('입양자가 자신의 채팅방 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].adopterId).toBe(adopterId);
            console.log('✅ 입양자 채팅방 목록 조회 성공, 건수:', response.body.length);
        });

        it('브리더가 자신의 채팅방 목록 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/chat/rooms')
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].breederId).toBe(breederId);
            console.log('✅ 브리더 채팅방 목록 조회 성공, 건수:', response.body.length);
        });

        it('인증 없이 요청 시 401 반환', async () => {
            await request(app.getHttpServer()).get('/api/chat/rooms').expect(401);
            console.log('✅ 미인증 채팅방 목록 조회 401 확인');
        });
    });

    /**
     * 3. 메시지 목록 조회
     */
    describe('GET /api/chat/rooms/:roomId/messages - 메시지 조회', () => {
        let roomId: string;

        beforeAll(async () => {
            const response = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId });

            roomId = response.body.id;
        });

        it('입양자가 채팅방 메시지 조회 성공 (빈 목록)', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/chat/rooms/${roomId}/messages`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            console.log('✅ 메시지 목록 조회 성공 (빈 목록)');
        });

        it('브리더가 채팅방 메시지 조회 성공', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/chat/rooms/${roomId}/messages`)
                .set('Authorization', `Bearer ${breederToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            console.log('✅ 브리더 메시지 조회 성공');
        });

        it('limit 쿼리 파라미터 적용', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/chat/rooms/${roomId}/messages?limit=10`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            console.log('✅ limit 파라미터 적용 확인');
        });

        it('참가자가 아닌 사용자가 메시지 조회 시 403 반환', async () => {
            // ChatPolicyService.requireParticipant → ForbiddenException(403)
            const anotherAdopter = await getAdopterToken(app);
            expect(anotherAdopter).not.toBeNull();

            await request(app.getHttpServer())
                .get(`/api/chat/rooms/${roomId}/messages`)
                .set('Authorization', `Bearer ${anotherAdopter!.token}`)
                .expect(403);

            console.log('✅ 비참가자 메시지 조회 403 확인');
        });

        it('존재하지 않는 roomId로 조회 시 404 반환', async () => {
            // ChatPolicyService.requireRoom → NotFoundException(404)
            await request(app.getHttpServer())
                .get('/api/chat/rooms/000000000000000000000000/messages')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(404);

            console.log('✅ 존재하지 않는 채팅방 조회 404 확인');
        });

        it('인증 없이 요청 시 401 반환', async () => {
            await request(app.getHttpServer())
                .get(`/api/chat/rooms/${roomId}/messages`)
                .expect(401);

            console.log('✅ 미인증 메시지 조회 401 확인');
        });
    });

    /**
     * 4. 채팅방 닫기
     */
    describe('DELETE /api/chat/rooms/:roomId - 채팅방 닫기', () => {
        let roomId: string;

        beforeEach(async () => {
            // 각 테스트마다 새 채팅방 생성
            const anotherBreeder = await getBreederToken(app);
            expect(anotherBreeder).not.toBeNull();

            const response = await request(app.getHttpServer())
                .post('/api/chat/rooms')
                .set('Authorization', `Bearer ${adopterToken}`)
                .send({ breederId: anotherBreeder!.breederId });

            roomId = response.body.id;
        });

        it('입양자가 채팅방 닫기 성공', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/chat/rooms/${roomId}`)
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            console.log('✅ 입양자 채팅방 닫기 성공:', roomId);
        });

        it('참가자가 아닌 사용자가 채팅방 닫기 시도 시 403 반환', async () => {
            // ChatPolicyService.requireParticipant → ForbiddenException(403)
            const anotherAdopter = await getAdopterToken(app);
            expect(anotherAdopter).not.toBeNull();

            await request(app.getHttpServer())
                .delete(`/api/chat/rooms/${roomId}`)
                .set('Authorization', `Bearer ${anotherAdopter!.token}`)
                .expect(403);

            console.log('✅ 비참가자 채팅방 닫기 403 확인');
        });

        it('존재하지 않는 roomId로 닫기 시도 시 404 반환', async () => {
            // ChatPolicyService.requireRoom → NotFoundException(404)
            await request(app.getHttpServer())
                .delete('/api/chat/rooms/000000000000000000000000')
                .set('Authorization', `Bearer ${adopterToken}`)
                .expect(404);

            console.log('✅ 존재하지 않는 채팅방 닫기 404 확인');
        });

        it('인증 없이 요청 시 401 반환', async () => {
            await request(app.getHttpServer())
                .delete(`/api/chat/rooms/${roomId}`)
                .expect(401);

            console.log('✅ 미인증 채팅방 닫기 401 확인');
        });
    });
});

import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { createTestingApp, getAdminToken, seedAdopter } from '../../../../../common/testing/test-utils';
import { NotificationFirebasePushAdapter } from '../../../notification/infrastructure/notification-firebase-push.adapter';

/** 실제 Guard·DTO·UseCase·MongoDB를 통과하는 공유 링크 계약 검증. */
describe('공유 링크 관리자 저장 → 공개 조회', () => {
    let app: INestApplication;
    let adminToken: string;
    let adopterToken: string;
    let connection: Connection;
    const payload = {
        slug: 'autumn-share',
        title: '가을 & 포퐁',
        targetPath: '/community/post/example-1?tab=comments',
    };

    beforeAll(async () => {
        app = await createTestingApp([
            { provide: NotificationFirebasePushAdapter, useValue: { sendToTokens: jest.fn().mockResolvedValue([]) } },
        ]);
        connection = app.get(getConnectionToken());
        await connection.model('DeepLink').init();
        adminToken = (await getAdminToken(app, randomUUID()))!;
        expect(adminToken).toBeTruthy();
        const adopter = await seedAdopter(app);
        await connection
            .collection('adopters')
            .updateOne({ _id: new Types.ObjectId(adopter.adopterId) }, { $set: { accountStatus: 'active' } });
        adopterToken = app.get(JwtService).sign({ sub: adopter.adopterId, role: 'adopter', email: adopter.email });
    }, 60000);

    afterAll(async () => {
        await app?.close();
    });
    beforeEach(async () => {
        await connection.collection('deep_links').deleteMany({});
    });

    const create = (body: object = payload) =>
        request(app.getHttpServer())
            .post('/api/deep-link-admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(body);

    it('OpenAPI가 관리자 인증과 실제 공개·목록 DTO 계약을 문서화한다', () => {
        const document = SwaggerModule.createDocument(
            app,
            new DocumentBuilder().addBearerAuth({ type: 'http', scheme: 'bearer' }, 'JWT-Auth').build(),
        );
        const admin = document.paths['/api/deep-link-admin'];
        expect(admin.get!.security).toContainEqual({ 'JWT-Auth': [] });
        expect(admin.post!.security).toContainEqual({ 'JWT-Auth': [] });
        expect(document.components!.schemas!.DeepLinkCreateRequestDto).toMatchObject({
            required: ['title', 'targetPath'],
        });
        const listSchema = (admin.get!.responses['200'] as any).content['application/json'].schema;
        expect(listSchema.allOf[1].properties.data.properties.items.items.$ref).toBe(
            '#/components/schemas/DeepLinkAdminResponseDto',
        );
        const publicRoute = document.paths['/api/v2/deep-links/{slug}'].get!;
        expect(publicRoute.security ?? []).toHaveLength(0);
        expect(publicRoute.responses['404']).toBeDefined();
    });

    it('관리자 생성값·기본값·표준 봉투가 공개 조회까지 유지된다', async () => {
        const saved = await create().expect(200);
        expect(saved.body.data).toMatchObject({ ...payload, description: '', imageUrl: '', isActive: true });
        expect(saved.body.data.id).toMatch(/^[a-f0-9]{24}$/);
        const resolved = await request(app.getHttpServer()).get(`/api/v2/deep-links/${payload.slug}`).expect(200);
        expect(resolved.headers['cache-control']).toBe('no-store');
        expect(resolved.body).toMatchObject({
            success: true,
            code: 200,
            data: { ...payload, description: '', imageUrl: '' },
        });
        expect(Object.keys(resolved.body.data).sort()).toEqual([
            'description',
            'imageUrl',
            'slug',
            'targetPath',
            'title',
        ]);
        expect(resolved.body.timestamp).toEqual(expect.any(String));
    });

    it('슬러그 자동 생성·목록 페이지네이션·수정·비활성화·삭제를 지원한다', async () => {
        const first = await create({ title: '자동 생성', targetPath: '/' }).expect(200);
        expect(first.body.data.slug).toMatch(/^[a-z0-9-]+$/);
        const second = await create().expect(200);
        const list = await request(app.getHttpServer())
            .get('/api/deep-link-admin?page=1&limit=1')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        expect(list.body.data.items).toHaveLength(1);
        expect(list.body.data.pagination).toEqual({
            currentPage: 1,
            pageSize: 1,
            totalItems: 2,
            totalPages: 2,
            hasNextPage: true,
            hasPrevPage: false,
        });
        const id = second.body.data.id;
        const edited = await request(app.getHttpServer())
            .put(`/api/deep-link-admin/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: '새 제목', targetPath: '/explore', imageUrl: 'https://example.com/image.png' })
            .expect(200);
        expect(edited.body.data.slug).toBe(payload.slug);
        const resolved = await request(app.getHttpServer()).get(`/api/v2/deep-links/${payload.slug}`).expect(200);
        expect(resolved.body.data).toMatchObject({
            title: '새 제목',
            targetPath: '/explore',
            imageUrl: 'https://example.com/image.png',
        });
        await request(app.getHttpServer())
            .put(`/api/deep-link-admin/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ isActive: false })
            .expect(200);
        await request(app.getHttpServer()).get(`/api/v2/deep-links/${payload.slug}`).expect(404);
        await request(app.getHttpServer()).get('/api/v2/deep-links/missing-link').expect(404);
        await request(app.getHttpServer())
            .delete(`/api/deep-link-admin/${id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        await request(app.getHttpServer()).get(`/api/v2/deep-links/${payload.slug}`).expect(404);
    });

    it('모든 관리자 메서드가 미인증 401·입양자 403을 반환한다', async () => {
        const saved = await create().expect(200);
        for (const token of [undefined, adopterToken]) {
            for (const method of ['get', 'post', 'put', 'delete'] as const) {
                const path = `/api/deep-link-admin${method === 'put' || method === 'delete' ? `/${saved.body.data.id}` : ''}`;
                let req = request(app.getHttpServer())[method](path);
                if (token) req = req.set('Authorization', `Bearer ${token}`);
                if (method === 'post' || method === 'put') req = req.send(payload);
                await req.expect(token ? 403 : 401);
            }
        }
    });

    it.each([
        ['targetPath', 'https://evil.example/path'],
        ['targetPath', '//evil.example'],
        ['targetPath', '/\\evil.example'],
        ['targetPath', 'javascript:alert(1)'],
        ['targetPath', '/%2f%2fevil.example'],
        ['targetPath', '/community/%252e%252e/api/auth'],
        ['targetPath', '/community/../api/auth'],
        ['targetPath', '/api/auth/clear-cookie'],
        ['targetPath', '/l/recursive'],
        ['targetPath', '/home?next=https%3A%2F%2Fevil.example'],
        ['targetPath', '/home%0aLocation:evil'],
        ['targetPath', '/home?x=%3Cscript%3E'],
        ['targetPath', '/home?x=%E0%A4%A'],
        ['title', '<script>alert(1)</script>'],
        ['description', '<img src=x onerror=alert(1)>'],
        ['title', '   '],
        ['imageUrl', 'javascript:alert(1)'],
        ['imageUrl', 'http://example.com/x.png'],
        ['imageUrl', 'https://user:pass@example.com/x.png'],
        ['slug', '../bad'],
        ['slug', 'UPPER'],
        ['slug', 'a'.repeat(81)],
        ['isActive', 'false'],
        ['isActive', null],
        ['title', null],
    ])('%s의 잘못된 값을 저장하지 않는다: %s', async (field, value) => {
        await create({ ...payload, [field]: value }).expect(400);
        expect(await connection.collection('deep_links').countDocuments()).toBe(0);
    });

    it('부분 수정에도 URL/텍스트 검증을 적용하고 기존 값을 보존한다', async () => {
        const saved = await create().expect(200);
        for (const body of [
            { targetPath: '//evil.example' },
            { title: null },
            { description: '<script>' },
            { imageUrl: 'data:text/html,x' },
        ]) {
            await request(app.getHttpServer())
                .put(`/api/deep-link-admin/${saved.body.data.id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(body)
                .expect(400);
        }
        const resolved = await request(app.getHttpServer()).get(`/api/v2/deep-links/${payload.slug}`).expect(200);
        expect(resolved.body.data.title).toBe(payload.title);
    });

    it('동시 동일 슬러그 생성은 한 번만 성공하고 나머지는 409다', async () => {
        const results = await Promise.all([create(), create()]);
        expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
        expect(await connection.collection('deep_links').countDocuments()).toBe(1);
    });
});

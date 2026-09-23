import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import type { AppSplashResult } from '../application/types/app-splash.type';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import {
    createTestingApp,
    getAdminToken,
    getAdopterToken,
    closeTestingApp,
} from '../../../../common/testing/test-utils';
import { AppSplash, AppSplashDocument } from '../../../../schema/app-splash.schema';
import { APP_SPLASH_DEFAULTS } from '../constants/app-splash.constants';
import { UploadAdminFileReferenceReaderAdapter } from '../../../admin/upload/infrastructure/upload-admin-file-reference-reader.adapter';

/** 실제 인증·저장소·공개 조회를 거쳐 관리 화면의 변경이 앱에 전달되는지 검증한다. */
describe('앱 스플래시 운영 계약', () => {
    let app: INestApplication<Server>;
    let token: string;
    let adopterToken: string;
    let model: Model<AppSplashDocument>;
    beforeAll(async () => {
        app = (await createTestingApp()) as INestApplication<Server>;
        token = (await getAdminToken(app))!;
        adopterToken = (await getAdopterToken(app))!.token;
        expect(token).toBeTruthy();
        expect(adopterToken).toBeTruthy();
        model = app.get(getModelToken(AppSplash.name));
        await model.init();
        if (process.env.SPLASH_OPENAPI_OUTPUT) {
            writeFileSync(
                process.env.SPLASH_OPENAPI_OUTPUT,
                JSON.stringify(SwaggerModule.createDocument(app, new DocumentBuilder().build())),
            );
        }
    }, 60000);
    afterAll(async () => {
        if (app) await closeTestingApp(app);
    });
    beforeEach(async () => {
        await model.deleteMany({});
    });

    it('설정이 없는 두 플랫폼은 SVG 기반 번들 로고 기본값을 반환한다', async () => {
        for (const platform of ['ios', 'android']) {
            const result = await request(app.getHttpServer()).get('/api/v2/app-splash').query({ platform }).expect(200);
            expect((result.body as { data: AppSplashResult }).data).toEqual({
                ...APP_SPLASH_DEFAULTS,
                platform,
                imageUrl: '',
                updatedAt: null,
            });
            expect(result.headers['cache-control']).toBe('no-store');
        }
    });
    it('로그인하지 않은 요청과 일반 사용자의 관리 접근을 차단한다', async () => {
        await request(app.getHttpServer()).get('/api/app-splash-admin').expect(401);
        await request(app.getHttpServer()).put('/api/app-splash-admin/ios').send(APP_SPLASH_DEFAULTS).expect(401);
        await request(app.getHttpServer())
            .get('/api/app-splash-admin')
            .set('Authorization', `Bearer ${adopterToken}`)
            .expect(403);
        await request(app.getHttpServer())
            .put('/api/app-splash-admin/ios')
            .set('Authorization', `Bearer ${adopterToken}`)
            .send(APP_SPLASH_DEFAULTS)
            .expect(403);
    });
    it('관리자 저장 → DB 영속화 → 공개 API 반영, 플랫폼 분리와 비활성화를 검증한다', async () => {
        const settings = {
            ...APP_SPLASH_DEFAULTS,
            imageFileName: 'app-splash/launch.png',
            backgroundColor: '#FFF4D0',
            durationMs: 2500,
            imageWidth: 240,
        };
        await request(app.getHttpServer())
            .put('/api/app-splash-admin/ios')
            .set('Authorization', `Bearer ${token}`)
            .send(settings)
            .expect(200);
        const read = await request(app.getHttpServer()).get('/api/v2/app-splash?platform=ios').expect(200);
        expect((read.body as { data: AppSplashResult }).data).toMatchObject(settings);
        expect((read.body as { data: AppSplashResult }).data.imageUrl).toMatch(/\/app-splash\/launch\.png$/);
        expect((read.body as { data: AppSplashResult }).data.updatedAt).toBeTruthy();
        expect((await model.findOne({ platform: 'ios' }))!.imageFileName).toBe(settings.imageFileName);
        const android = await request(app.getHttpServer()).get('/api/v2/app-splash?platform=android').expect(200);
        expect((android.body as { data: AppSplashResult }).data.imageFileName).toBe('');
        await request(app.getHttpServer())
            .put('/api/app-splash-admin/ios')
            .set('Authorization', `Bearer ${token}`)
            .send({ ...APP_SPLASH_DEFAULTS, isEnabled: false })
            .expect(200);
        const disabled = await request(app.getHttpServer()).get('/api/v2/app-splash?platform=ios').expect(200);
        expect((disabled.body as { data: AppSplashResult }).data).toMatchObject({
            isEnabled: false,
            imageUrl: '',
            imageFileName: '',
        });
        expect(await model.countDocuments({ platform: 'ios' })).toBe(1);
        const list = await request(app.getHttpServer())
            .get('/api/app-splash-admin')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(
            (list.body as { data: AppSplashResult[] }).data.map((item: { platform: string }) => item.platform),
        ).toEqual(['ios', 'android']);
    });
    it.each([
        { durationMs: -1 },
        { durationMs: 3001 },
        { durationMs: 1.5 },
        { imageWidth: 0 },
        { imageWidth: 321 },
        { backgroundColor: 'red' },
        { isEnabled: 'true' },
        { imageFileName: 'https://evil.example/x.png' },
        { imageFileName: 'app-splash/../private.png' },
        { imageFileName: 'app-splash/file.svg' },
        { imageFileName: null },
        { unexpected: 'field' },
    ])('불완전하거나 위험한 표시 설정을 거부한다: %j', async (invalid) => {
        await request(app.getHttpServer())
            .put('/api/app-splash-admin/ios')
            .set('Authorization', `Bearer ${token}`)
            .send({ ...APP_SPLASH_DEFAULTS, ...invalid })
            .expect(400);
        expect(await model.countDocuments()).toBe(0);
    });
    it('지원하지 않는 플랫폼과 필수 필드 누락을 거부한다', async () => {
        await request(app.getHttpServer()).get('/api/v2/app-splash?platform=windows').expect(400);
        await request(app.getHttpServer()).get('/api/v2/app-splash').expect(400);
        await request(app.getHttpServer())
            .put('/api/app-splash-admin/windows')
            .set('Authorization', `Bearer ${token}`)
            .send(APP_SPLASH_DEFAULTS)
            .expect(400);
        await request(app.getHttpServer())
            .put('/api/app-splash-admin/ios')
            .set('Authorization', `Bearer ${token}`)
            .send({ isEnabled: true })
            .expect(400);
    });
    it('비활성화된 스플래시의 이미지도 고아 파일로 삭제하지 않는다', async () => {
        await model.create({
            ...APP_SPLASH_DEFAULTS,
            platform: 'ios',
            isEnabled: false,
            imageFileName: 'app-splash/kept.png',
        });
        const references = app.get(UploadAdminFileReferenceReaderAdapter);
        expect(await references.findReferences('app-splash/kept.png')).toContainEqual({
            collection: 'app_splashes',
            field: 'imageFileName',
            count: 1,
        });
        expect(await references.readAllReferencedFiles()).toContain('app-splash/kept.png');
    });
});

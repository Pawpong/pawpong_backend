import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../../common/testing/test-utils';

/**
 * v2 커뮤니티 게시글 작성/수정/삭제 — 라우팅/가드/검증/소유권/소프트 삭제 계약 커버리지.
 */
describe('v2 커뮤니티 작성/수정/삭제 종단간 테스트', () => {
    let app: INestApplication;
    let connection: Connection;
    let jwtService: JwtService;

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
        jwtService = app.get(JwtService);
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await connection.collection('community_posts').deleteMany({});
        await connection.collection('adopters').deleteMany({});
        await connection.collection('breeders').deleteMany({});
    });

    async function seedAdopter(
        suffix: string = String(Date.now()) + Math.random().toString(36).slice(2, 6),
    ): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('adopters').insertOne({
            _id,
            emailAddress: `adopter-${suffix}@test.com`,
            nickname: `입양자-${suffix}`,
            accountStatus: 'active',
            favoriteBreederList: [],
            submittedReportList: [],
        } as any);
        return String(_id);
    }

    async function seedBreeder(
        suffix: string = String(Date.now()) + Math.random().toString(36).slice(2, 6),
    ): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('breeders').insertOne({
            _id,
            emailAddress: `breeder-${suffix}@test.com`,
            nickname: `브리더-${suffix}`,
            accountStatus: 'active',
            verification: { plan: 'basic', level: 'new' },
            stats: {},
            profile: { description: '', location: { city: '', district: '' } },
        } as any);
        return String(_id);
    }

    async function adopterToken(userId: string) {
        return jwtService.signAsync({ sub: userId, email: 'a@t', role: 'adopter' });
    }

    async function brandToken(userId: string) {
        return jwtService.signAsync({ sub: userId, email: 'b@t', role: 'breeder' });
    }

    describe('POST /api/v2/community/posts', () => {
        it('비로그인 → 401', async () => {
            await request(app.getHttpServer()).post('/api/v2/community/posts').send({ body: '본문' }).expect(401);
        });

        it('body 누락 → 400 (DTO 검증)', async () => {
            const a = await seedAdopter();
            const tok = await adopterToken(a);
            await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({})
                .expect(400);
        });

        it('정상 — denormalized author snapshot 이 doc 에 저장', async () => {
            const a = await seedAdopter();
            const tok = await adopterToken(a);
            const res = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '본문 텍스트', petType: 'reptile', category: '레오파드' })
                .expect(200);

            expect(res.body.data.authorId).toBe(a);
            expect(res.body.data.authorModel).toBe('Adopter');
            expect(res.body.data.authorNickname).toMatch(/^입양자-/);
            expect(res.body.data.body).toBe('본문 텍스트');
            expect(res.body.data.petType).toBe('reptile');
            expect(res.body.data.category).toBe('레오파드');
            expect(res.body.data.commentPreview).toEqual([]);

            const doc = await connection
                .collection('community_posts')
                .findOne({ _id: new Types.ObjectId(res.body.data.postId) });
            expect(doc?.authorNickname).toMatch(/^입양자-/);
            expect(doc?.isActive).toBe(true);
        });

        it('브리더 role → authorModel=Breeder', async () => {
            const b = await seedBreeder();
            const tok = await brandToken(b);
            const res = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '브리더 본문' })
                .expect(200);
            expect(res.body.data.authorModel).toBe('Breeder');
            expect(res.body.data.authorNickname).toMatch(/^브리더-/);
        });
    });

    describe('PATCH /api/v2/community/posts/:postId', () => {
        it('다른 사람 게시글 → 403', async () => {
            const a1 = await seedAdopter();
            const tok1 = await adopterToken(a1);
            const created = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok1}`)
                .send({ body: '본문' })
                .expect(200);
            const postId = created.body.data.postId;

            const a2 = await seedAdopter();
            const tok2 = await adopterToken(a2);
            await request(app.getHttpServer())
                .patch(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${tok2}`)
                .send({ body: '훔쳐서 수정' })
                .expect(403);
        });

        it('본인 게시글 — 200 + 본문 반영', async () => {
            const a = await seedAdopter();
            const tok = await adopterToken(a);
            const created = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '원본' })
                .expect(200);
            const postId = created.body.data.postId;
            const updated = await request(app.getHttpServer())
                .patch(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '  새 본문  ' })
                .expect(200);
            expect(updated.body.data.body).toBe('새 본문');
        });

        it('body 를 공백으로 수정 시도 → 400', async () => {
            const a = await seedAdopter();
            const tok = await adopterToken(a);
            const created = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '원본' })
                .expect(200);
            await request(app.getHttpServer())
                .patch(`/api/v2/community/posts/${created.body.data.postId}`)
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '  ' })
                .expect(400);
        });
    });

    describe('DELETE /api/v2/community/posts/:postId', () => {
        it('타인 게시글 → 403', async () => {
            const a1 = await seedAdopter();
            const tok1 = await adopterToken(a1);
            const created = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok1}`)
                .send({ body: '본문' })
                .expect(200);
            const postId = created.body.data.postId;
            const a2 = await seedAdopter();
            const tok2 = await adopterToken(a2);
            await request(app.getHttpServer())
                .delete(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${tok2}`)
                .expect(403);
        });

        it('본인 — 200 + 소프트 삭제 (목록/상세에서 사라짐)', async () => {
            const a = await seedAdopter();
            const tok = await adopterToken(a);
            const created = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({ body: '본문' })
                .expect(200);
            const postId = created.body.data.postId;
            await request(app.getHttpServer())
                .delete(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${tok}`)
                .expect(200);
            // 상세 조회 - 더 이상 노출되지 않음
            await request(app.getHttpServer()).get(`/api/v2/community/posts/${postId}`).expect(400);
            // doc 은 남아있지만 isActive=false
            const doc = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
            expect(doc?.isActive).toBe(false);
        });
    });
});

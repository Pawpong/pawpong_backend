import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../../../common/testing/test-utils';

/**
 * v2 커뮤니티 — 공개범위(전체/팔로워/나만보기) 열람 제한 + 임시저장(draft) 종단간 계약.
 */
describe('v2 커뮤니티 공개범위/임시저장 종단간 테스트', () => {
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
        await connection.collection('user_follows').deleteMany({});
    });

    async function seedAdopter(): Promise<string> {
        const _id = new Types.ObjectId();
        const suffix = String(Date.now()) + Math.random().toString(36).slice(2, 6);
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

    async function token(userId: string) {
        return jwtService.signAsync({ sub: userId, email: 'a@t', role: 'adopter' });
    }

    async function createPost(tok: string, body: Record<string, unknown>): Promise<string> {
        const res = await request(app.getHttpServer())
            .post('/api/v2/community/posts')
            .set('Authorization', `Bearer ${tok}`)
            .send(body)
            .expect(200);
        return res.body.data.postId;
    }

    async function follow(followerId: string, followeeId: string) {
        await connection.collection('user_follows').insertOne({ followerId, followeeId, createdAt: new Date() });
    }

    const listPostIds = async (tok?: string): Promise<string[]> => {
        const req = request(app.getHttpServer()).get('/api/v2/community/posts?page=1&pageSize=60');
        if (tok) req.set('Authorization', `Bearer ${tok}`);
        const res = await req.expect(200);
        return res.body.data.items.map((i: { postId: string }) => i.postId);
    };

    describe('임시저장(draft)', () => {
        it('빈 본문이어도 draft 로 저장되고 status=draft 로 응답', async () => {
            const a = await seedAdopter();
            const tok = await token(a);
            const res = await request(app.getHttpServer())
                .post('/api/v2/community/posts')
                .set('Authorization', `Bearer ${tok}`)
                .send({ status: 'draft', body: '' })
                .expect(200);
            expect(res.body.data.status).toBe('draft');
        });

        it('draft 는 공개 피드에 노출되지 않고, 본인 임시저장 목록에만 노출', async () => {
            const a = await seedAdopter();
            const tok = await token(a);
            const draftId = await createPost(tok, { status: 'draft', body: '작성 중' });

            // 공개 피드(비인증)에 없음
            expect(await listPostIds()).not.toContain(draftId);
            // 작성자 피드(published 필터)에도 없음
            expect(await listPostIds(tok)).not.toContain(draftId);

            // 내 임시저장 목록에는 있음
            const drafts = await request(app.getHttpServer())
                .get('/api/v2/community/posts/me/drafts')
                .set('Authorization', `Bearer ${tok}`)
                .expect(200);
            expect(drafts.body.data.items.map((i: { postId: string }) => i.postId)).toContain(draftId);
        });

        it('임시저장 목록은 비인증 → 401', async () => {
            await request(app.getHttpServer()).get('/api/v2/community/posts/me/drafts').expect(401);
        });

        it('draft → published 발행 전환 (본문 있으면 성공, 피드에 노출)', async () => {
            const a = await seedAdopter();
            const tok = await token(a);
            const draftId = await createPost(tok, { status: 'draft', body: '발행 예정 본문' });

            await request(app.getHttpServer())
                .patch(`/api/v2/community/posts/${draftId}`)
                .set('Authorization', `Bearer ${tok}`)
                .send({ status: 'published' })
                .expect(200);

            expect(await listPostIds()).toContain(draftId);
        });

        it('본문 없는 draft 를 published 로 전환 시도 → 400', async () => {
            const a = await seedAdopter();
            const tok = await token(a);
            const draftId = await createPost(tok, { status: 'draft', body: '' });

            await request(app.getHttpServer())
                .patch(`/api/v2/community/posts/${draftId}`)
                .set('Authorization', `Bearer ${tok}`)
                .send({ status: 'published' })
                .expect(400);
        });

        it('draft 수정 시 body 빈 문자열은 본문 삭제로 저장하고 사진은 유지한다', async () => {
            const a = await seedAdopter();
            const tok = await token(a);
            const draftId = await createPost(tok, { status: 'draft', body: '작성 중 본문' });

            const res = await request(app.getHttpServer())
                .patch(`/api/v2/community/posts/${draftId}`)
                .set('Authorization', `Bearer ${tok}`)
                .send({
                    body: '',
                    photos: ['community/example.jpg'],
                    visibility: 'public',
                    status: 'draft',
                })
                .expect(200);

            expect(res.body.data.body).toBe('');
            expect(res.body.data.photoUrls[0]).toContain('/community/example.jpg');
            expect(res.body.data.status).toBe('draft');

            const saved = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(draftId) });
            expect(saved?.body).toBe('');
            expect(saved?.photos).toEqual(['community/example.jpg']);
            expect(saved?.status).toBe('draft');
        });
    });

    describe('나만보기(private)', () => {
        it('작성자만 목록/상세 열람, 타인·비인증은 제외', async () => {
            const author = await seedAdopter();
            const authorTok = await token(author);
            const other = await seedAdopter();
            const otherTok = await token(other);

            const postId = await createPost(authorTok, { visibility: 'private', body: '비밀 글' });

            // 목록: 작성자만 포함
            expect(await listPostIds(authorTok)).toContain(postId);
            expect(await listPostIds(otherTok)).not.toContain(postId);
            expect(await listPostIds()).not.toContain(postId);

            // 상세: 작성자 200, 타인/비인증 400
            await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${authorTok}`)
                .expect(200);
            await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${otherTok}`)
                .expect(400);
            await request(app.getHttpServer()).get(`/api/v2/community/posts/${postId}`).expect(400);
        });
    });

    describe('팔로워공개(followers)', () => {
        it('팔로워는 열람 가능, 비팔로워는 제외', async () => {
            const author = await seedAdopter();
            const authorTok = await token(author);
            const follower = await seedAdopter();
            const followerTok = await token(follower);
            const stranger = await seedAdopter();
            const strangerTok = await token(stranger);

            await follow(follower, author); // follower → author 팔로우

            const postId = await createPost(authorTok, { visibility: 'followers', body: '팔로워 전용' });

            // 목록
            expect(await listPostIds(authorTok)).toContain(postId); // 본인
            expect(await listPostIds(followerTok)).toContain(postId); // 팔로워
            expect(await listPostIds(strangerTok)).not.toContain(postId); // 비팔로워
            expect(await listPostIds()).not.toContain(postId); // 비인증

            // 상세
            await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${followerTok}`)
                .expect(200);
            await request(app.getHttpServer())
                .get(`/api/v2/community/posts/${postId}`)
                .set('Authorization', `Bearer ${strangerTok}`)
                .expect(400);
        });
    });
});

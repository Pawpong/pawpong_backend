import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../common/testing/test-utils';
import { CONTENT_RIGHTS_VERSION } from '../../../common/content-rights/app-request-context';

describe('iOS 앱에서 작성자 재동의 전 공개 콘텐츠 숨김', () => {
    let app: INestApplication;
    let connection: Connection;
    const authorId = new Types.ObjectId();
    const postId = new Types.ObjectId();

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
        await connection.collection('adopters').insertOne({
            _id: authorId,
            accountStatus: 'active',
            nickname: '기존 작성자',
        });
        await connection.collection('community_posts').insertOne({
            _id: postId,
            authorId,
            authorModel: 'Adopter',
            authorNickname: '기존 작성자',
            title: '기존 게시물',
            body: '동의 전 게시물',
            photos: [],
            petType: 'reptile',
            category: '레오파드',
            visibility: 'public',
            status: 'published',
            likeCount: 0,
            commentCount: 0,
            saveCount: 0,
            viewCount: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }, 30000);

    afterAll(async () => { await app?.close(); });

    it('웹에서는 기존 게시물이 유지되고 iOS 앱 목록·상세에서는 동의 전 숨겨진다', async () => {
        const webList = await request(app.getHttpServer()).get('/api/v2/community/posts').expect(200);
        expect(webList.body.data.items.some((item: { postId: string }) => item.postId === String(postId))).toBe(true);

        const appList = await request(app.getHttpServer())
            .get('/api/v2/community/posts')
            .set('User-Agent', 'Mozilla/5.0 PawpongApp/iOS')
            .expect(200);
        expect(appList.body.data.items).toHaveLength(0);
        await request(app.getHttpServer())
            .get(`/api/v2/community/posts/${postId}`)
            .set('User-Agent', 'Mozilla/5.0 PawpongApp/iOS')
            .expect(400);

        await connection.collection('adopters').updateOne({ _id: authorId }, {
            $set: { contentRightsConsentVersion: CONTENT_RIGHTS_VERSION, contentRightsConsentedAt: new Date() },
        });
        const consentedList = await request(app.getHttpServer())
            .get('/api/v2/community/posts')
            .set('User-Agent', 'Mozilla/5.0 PawpongApp/iOS')
            .expect(200);
        expect(consentedList.body.data.items.some((item: { postId: string }) => item.postId === String(postId))).toBe(true);
    });
});

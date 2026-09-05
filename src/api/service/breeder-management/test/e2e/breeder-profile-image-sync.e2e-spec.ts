import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp, getBreederToken } from '../../../../../common/testing/test-utils';

/**
 * 브리더 프로필 이미지 변경 → 커뮤니티 작성자 snapshot 동기화 종단간(HTTP) 검증.
 *
 * controller(PATCH /v2/breeder-management/profile) → use-case → USER_PROFILE_UPDATED_EVENT emit
 * → CommunityAuthorSyncListener → repository updateMany 까지 실제 앱/Mongo 로 확인한다.
 * (adopter PATCH 경로와 동일한 이벤트를 브리더 경로에서도 발행하는지 보장한다.)
 */
describe('v2 브리더 프로필 이미지 변경 → 커뮤니티 snapshot 동기화 (HTTP)', () => {
    let app: INestApplication;
    let connection: Connection;
    let token: string;
    let breederId: string;

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());

        const breeder = await getBreederToken(app);
        if (!breeder) {
            throw new Error('브리더 테스트 계정 생성 실패');
        }
        token = breeder.token;
        breederId = breeder.breederId;
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await connection.collection('community_posts').deleteMany({});
    });

    /** 로그인한 브리더가 작성한 것으로 게시글 snapshot 을 seed 한다. */
    async function seedBreederPost(imageFile: string): Promise<Types.ObjectId> {
        const _id = new Types.ObjectId();
        await connection.collection('community_posts').insertOne({
            _id,
            authorId: new Types.ObjectId(breederId),
            authorModel: 'Breeder',
            authorNickname: '테스트브리더',
            authorProfileImageFileName: imageFile,
            body: '본문',
            photos: [],
            visibility: 'public',
            status: 'published',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return _id;
    }

    /** 리스너(@OnEvent)는 emit 이후 비동기로 도므로 snapshot 이 기대값이 될 때까지 짧게 폴링한다. */
    async function waitForSnapshotImage(postId: Types.ObjectId, expected: string): Promise<string | undefined> {
        for (let attempt = 0; attempt < 40; attempt++) {
            const post = await connection.collection('community_posts').findOne({ _id: postId });
            if (post?.authorProfileImageFileName === expected) {
                return post?.authorProfileImageFileName as string | undefined;
            }
            await new Promise((resolve) => setTimeout(resolve, 25));
        }
        const post = await connection.collection('community_posts').findOne({ _id: postId });
        return post?.authorProfileImageFileName as string | undefined;
    }

    it('프로필 이미지를 바꾸면 내 게시글의 authorProfileImageFileName snapshot 이 갱신된다', async () => {
        const postId = await seedBreederPost('old.png');

        await request(app.getHttpServer())
            .patch('/api/v2/breeder-management/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ profileImage: 'profiles/new.png' })
            .expect(200);

        const synced = await waitForSnapshotImage(postId, 'profiles/new.png');
        expect(synced).toBe('profiles/new.png');
    });

    it('프로필 이미지를 제거(빈 문자열)하면 snapshot 도 빈 문자열로 동기화된다', async () => {
        const postId = await seedBreederPost('old.png');

        await request(app.getHttpServer())
            .patch('/api/v2/breeder-management/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ profileImage: '' })
            .expect(200);

        const synced = await waitForSnapshotImage(postId, '');
        expect(synced).toBe('');
    });
});

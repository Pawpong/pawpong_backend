import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import { createTestingApp } from '../../../../../common/testing/test-utils';
import { USER_PROFILE_UPDATED_EVENT } from '../../../../../common/events/user-profile-updated.event';

/**
 * 프로필(닉네임/이미지) 변경 이벤트 → 커뮤니티 작성자 snapshot 동기화 종단간 검증.
 * 이벤트 리스너 등록 + repository updateMany 경로를 실제 앱/Mongo 로 확인한다.
 */
describe('v2 커뮤니티 작성자 snapshot 동기화 (이벤트)', () => {
    let app: INestApplication;
    let connection: Connection;
    let eventEmitter: EventEmitter2;

    const authorId = new Types.ObjectId();

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
        eventEmitter = app.get(EventEmitter2);
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await connection.collection('community_posts').deleteMany({});
        await connection.collection('community_post_comments').deleteMany({});
    });

    async function seedPost(nickname: string, imageFile?: string): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_posts').insertOne({
            _id,
            authorId,
            authorModel: 'Adopter',
            authorNickname: nickname,
            authorProfileImageFileName: imageFile,
            body: '본문',
            photos: [],
            visibility: 'public',
            status: 'published',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return String(_id);
    }

    async function seedComment(nickname: string): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_post_comments').insertOne({
            _id,
            postId: new Types.ObjectId(),
            authorId,
            authorModel: 'Adopter',
            authorNickname: nickname,
            body: '댓글',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return String(_id);
    }

    it('닉네임·이미지 변경 이벤트가 내 게시글/댓글 snapshot 을 갱신한다', async () => {
        const postId = await seedPost('야마다료', 'old.png');
        const commentId = await seedComment('야마다료');

        // emitAsync 로 리스너(@OnEvent) 완료까지 대기
        await eventEmitter.emitAsync(USER_PROFILE_UPDATED_EVENT, {
            userId: String(authorId),
            nickname: '장원영',
            profileImageFileName: 'new.png',
        });

        const post = await connection.collection('community_posts').findOne({ _id: new Types.ObjectId(postId) });
        const comment = await connection
            .collection('community_post_comments')
            .findOne({ _id: new Types.ObjectId(commentId) });

        expect(post?.authorNickname).toBe('장원영');
        expect(post?.authorProfileImageFileName).toBe('new.png');
        expect(comment?.authorNickname).toBe('장원영');
    });

    it('다른 작성자의 글은 건드리지 않는다', async () => {
        const otherId = new Types.ObjectId();
        const _id = new Types.ObjectId();
        await connection.collection('community_posts').insertOne({
            _id,
            authorId: otherId,
            authorModel: 'Adopter',
            authorNickname: '다른사람',
            body: '본문',
            photos: [],
            visibility: 'public',
            status: 'published',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await eventEmitter.emitAsync(USER_PROFILE_UPDATED_EVENT, {
            userId: String(authorId),
            nickname: '장원영',
        });

        const other = await connection.collection('community_posts').findOne({ _id });
        expect(other?.authorNickname).toBe('다른사람');
    });
});

import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import request from 'supertest';

import { createTestingApp } from '../../../../../common/testing/test-utils';

/**
 * 목록 카드 commentPreview + search 파라미터 종단간 테스트.
 *
 * 프론트 피드 카드가 카드마다 상세를 호출하지 않도록 목록 1콜로 해결되는지,
 * 검색이 기존 필터·열람범위와 AND 로 안전하게 결합되는지 확인한다.
 */
describe('커뮤니티 목록 — 댓글 미리보기 / 키워드 검색 (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await connection.collection('community_posts').deleteMany({});
        await connection.collection('community_post_comments').deleteMany({});
    });

    async function seedPost(overrides: Record<string, unknown> = {}): Promise<string> {
        const _id = new Types.ObjectId();
        await connection.collection('community_posts').insertOne({
            _id,
            authorId: new Types.ObjectId(),
            authorModel: 'Adopter',
            authorNickname: '작성자',
            title: '제목',
            body: '본문입니다',
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
            ...overrides,
        });
        return String(_id);
    }

    async function seedComment(postId: string, body: string, nickname: string, createdAt: Date): Promise<void> {
        await connection.collection('community_post_comments').insertOne({
            _id: new Types.ObjectId(),
            postId: new Types.ObjectId(postId),
            authorId: new Types.ObjectId(),
            authorModel: 'Adopter',
            authorNickname: nickname,
            parentCommentId: null,
            body,
            likeCount: 0,
            isActive: true,
            createdAt,
            updatedAt: createdAt,
        });
    }

    function listPosts(query = ''): request.Test {
        return request(app.getHttpServer()).get(`/api/v2/community/posts${query}`);
    }

    describe('commentPreview', () => {
        it('카드에 최신 댓글 1건이 작성자 닉네임·본문과 함께 담긴다', async () => {
            const postId = await seedPost();
            await seedComment(postId, '오래된 댓글', '옛날사람', new Date('2026-01-01T00:00:00Z'));
            await seedComment(postId, '미리보기 댓글입니다', '댓글러', new Date('2026-06-01T00:00:00Z'));

            const response = await listPosts().expect(200);

            const card = response.body.data.items[0];
            expect(card.commentPreview).toHaveLength(1);
            expect(card.commentPreview[0].body).toBe('미리보기 댓글입니다');
            expect(card.commentPreview[0].author.nickname).toBe('댓글러');
        });

        it('댓글이 없으면 빈 배열이다 (null 아님)', async () => {
            await seedPost();

            const response = await listPosts().expect(200);

            expect(response.body.data.items[0].commentPreview).toEqual([]);
        });

        it('삭제된 댓글은 미리보기에 잡히지 않는다', async () => {
            const postId = await seedPost();
            await seedComment(postId, '살아있는 댓글', '정상', new Date('2026-01-01T00:00:00Z'));
            await connection.collection('community_post_comments').insertOne({
                _id: new Types.ObjectId(),
                postId: new Types.ObjectId(postId),
                authorId: new Types.ObjectId(),
                authorModel: 'Adopter',
                authorNickname: '삭제됨',
                parentCommentId: null,
                body: '삭제된 최신 댓글',
                likeCount: 0,
                isActive: false,
                createdAt: new Date('2026-06-01T00:00:00Z'),
                updatedAt: new Date(),
            });

            const response = await listPosts().expect(200);

            expect(response.body.data.items[0].commentPreview[0].body).toBe('살아있는 댓글');
        });

        it('여러 게시글이 각자의 최신 댓글을 갖는다 (배치 조회 정확성)', async () => {
            const postA = await seedPost({ title: 'A', createdAt: new Date('2026-05-01T00:00:00Z') });
            const postB = await seedPost({ title: 'B', createdAt: new Date('2026-05-02T00:00:00Z') });
            await seedComment(postA, 'A 의 댓글', 'a', new Date('2026-06-01T00:00:00Z'));
            await seedComment(postB, 'B 의 댓글', 'b', new Date('2026-06-02T00:00:00Z'));

            const response = await listPosts().expect(200);

            const byTitle = Object.fromEntries(
                response.body.data.items.map((item: { title: string; commentPreview: { body: string }[] }) => [
                    item.title,
                    item.commentPreview[0]?.body,
                ]),
            );
            expect(byTitle).toEqual({ A: 'A 의 댓글', B: 'B 의 댓글' });
        });
    });

    describe('search', () => {
        it('제목으로 검색된다', async () => {
            await seedPost({ title: '레오파드 게코 분양', body: '무관한 본문' });
            await seedPost({ title: '고양이 일기', body: '무관한 본문' });

            const response = await listPosts('?search=레오파드').expect(200);

            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe('레오파드 게코 분양');
        });

        it('본문으로도 검색된다', async () => {
            await seedPost({ title: '무관한 제목', body: '우리집 레오파드 자랑' });
            await seedPost({ title: '무관한 제목', body: '전혀 다른 내용' });

            const response = await listPosts('?search=레오파드').expect(200);

            expect(response.body.data.items).toHaveLength(1);
        });

        it('기존 필터와 AND 로 결합된다', async () => {
            await seedPost({ title: '레오파드 이야기', petType: 'reptile' });
            await seedPost({ title: '레오파드 무늬 고양이', petType: 'cat' });

            const response = await listPosts('?search=레오파드&petType=reptile').expect(200);

            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].petType).toBe('reptile');
        });

        it('검색 시에도 비공개 글은 새지 않는다 (열람범위 $or 가 덮이지 않음)', async () => {
            await seedPost({ title: '레오파드 공개글', visibility: 'public' });
            await seedPost({ title: '레오파드 나만보기', visibility: 'private' });
            await seedPost({ title: '레오파드 팔로워공개', visibility: 'followers' });

            const response = await listPosts('?search=레오파드').expect(200);

            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe('레오파드 공개글');
        });

        it('정규식 메타문자를 넣어도 오류 없이 리터럴로 검색된다', async () => {
            await seedPost({ title: '가격 (특가).*', body: '무관' });
            await seedPost({ title: '평범한 제목', body: '무관' });

            const response = await listPosts('?search=' + encodeURIComponent('(특가).*')).expect(200);

            expect(response.body.data.items).toHaveLength(1);
            expect(response.body.data.items[0].title).toBe('가격 (특가).*');
        });

        it('search 미지정 시 기존과 동일하게 전체를 반환한다', async () => {
            await seedPost({ title: '가' });
            await seedPost({ title: '나' });

            const response = await listPosts().expect(200);

            expect(response.body.data.items).toHaveLength(2);
        });
    });
});

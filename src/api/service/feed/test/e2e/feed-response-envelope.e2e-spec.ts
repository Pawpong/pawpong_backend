import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestingApp } from '../../../../../common/testing/test-utils';

/**
 * feed 도메인 응답 계약 검증.
 *
 * feed 는 플랫폼 표준 응답 봉투({ success, code, data, ... })를 쓰지 않고
 * raw 객체를 그대로 반환하던 유일한 도메인이었다. 프론트는 다른 도메인과 동일하게
 * unwrap() 으로 봉투를 기대하고 있어 댓글·태그 조회가 실패했다.
 * 여기서는 봉투가 실제로 씌워지는지와, 태그 검색 검증 오류가 500 이 아닌 400 인지를 본다.
 */
describe('피드 응답 봉투 계약 (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    /** 표준 봉투 형태 */
    interface Envelope {
        success?: unknown;
        code?: unknown;
        data?: unknown;
        message?: unknown;
        timestamp?: unknown;
    }

    const expectEnvelope = (body: Envelope): void => {
        expect(body.success).toBe(true);
        expect(body.code).toBe(200);
        expect(body).toHaveProperty('data');
        expect(typeof body.message).toBe('string');
        expect(typeof body.timestamp).toBe('string');
    };

    it('피드 목록이 표준 봉투로 감싸진다', async () => {
        const response = await request(app.getHttpServer()).get('/api/v2/feed/videos?page=1&limit=1').expect(200);

        expectEnvelope(response.body as Envelope);
        // 기존 payload 는 data 안으로 그대로 이동한다 (필드 손실 없음)
        expect((response.body as Envelope).data).toHaveProperty('items');
        expect((response.body as Envelope).data).toHaveProperty('pagination');
    });

    it('인기 동영상·인기 태그도 동일한 봉투를 쓴다', async () => {
        const popular = await request(app.getHttpServer()).get('/api/v2/feed/videos/popular?limit=1').expect(200);
        expectEnvelope(popular.body as Envelope);
        expect(Array.isArray((popular.body as Envelope).data)).toBe(true);

        const tags = await request(app.getHttpServer()).get('/api/v2/feed/tag/popular?limit=1').expect(200);
        expectEnvelope(tags.body as Envelope);
        expect(Array.isArray((tags.body as Envelope).data)).toBe(true);
    });

    it('태그 자동완성이 봉투 안에 배열로 내려온다', async () => {
        const response = await request(app.getHttpServer()).get('/api/v2/feed/tag/suggest?q=강').expect(200);

        expectEnvelope(response.body as Envelope);
        expect(Array.isArray((response.body as Envelope).data)).toBe(true);
    });

    it('태그 검색은 tag 를 주면 200 + 봉투로 응답한다', async () => {
        const response = await request(app.getHttpServer()).get('/api/v2/feed/tag/search?tag=강아지').expect(200);

        expectEnvelope(response.body as Envelope);
        expect((response.body as Envelope).data).toHaveProperty('videos');
    });

    it('tag 파라미터 누락은 500 이 아니라 400 으로 거부한다', async () => {
        const response = await request(app.getHttpServer()).get('/api/v2/feed/tag/search').expect(400);

        const body = response.body as Envelope;
        expect(body.success).toBe(false);
        expect(body.code).toBe(400);
    });

    it('빈 tag 도 400 으로 거부한다', async () => {
        await request(app.getHttpServer()).get('/api/v2/feed/tag/search?tag=').expect(400);
    });
});

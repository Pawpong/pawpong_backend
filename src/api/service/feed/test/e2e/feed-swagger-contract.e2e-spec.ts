import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';

import { createTestingApp } from '../../../../../common/testing/test-utils';

/**
 * feed Swagger 명세가 실제 HTTP 응답과 일치하는지 검증한다.
 *
 * feed 는 봉투 없이 응답하던 시절 ApiRawEndpoint(봉투 미표기)로 문서화돼 있었다.
 * 컨트롤러만 봉투로 바꾸면 문서와 실응답이 어긋나므로, 생성된 OpenAPI 스키마에
 * success/code/data 가 실제로 선언돼 있는지 스펙 자체를 읽어 확인한다.
 */
describe('피드 Swagger 계약 일치 (e2e)', () => {
    let app: INestApplication;
    let spec: Record<string, any>;

    beforeAll(async () => {
        app = await createTestingApp();
        const config = new DocumentBuilder().setTitle('t').setVersion('1').build();
        spec = SwaggerModule.createDocument(app, config) as unknown as Record<string, any>;
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    /** 200 응답 스키마에서 봉투 속성을 뽑는다 (allOf / 직접 properties 양쪽 지원) */
    const envelopeProps = (path: string, method: string): Record<string, unknown> | undefined => {
        const schema = spec.paths?.[path]?.[method]?.responses?.['200']?.content?.['application/json']?.schema;
        if (!schema) return undefined;
        if (schema.properties) return schema.properties;
        const fromAllOf = (schema.allOf ?? []).find((s: any) => s.properties)?.properties;
        return fromAllOf;
    };

    const WRAPPED = [
        ['/api/v2/feed/videos', 'get'],
        ['/api/v2/feed/videos/popular', 'get'],
        ['/api/v2/feed/videos/{videoId}', 'get'],
        ['/api/v2/feed/tag/search', 'get'],
        ['/api/v2/feed/tag/popular', 'get'],
        ['/api/v2/feed/tag/suggest', 'get'],
        ['/api/v2/feed/comment/{videoId}', 'get'],
    ] as const;

    it.each(WRAPPED)('%s %s 문서가 봉투(success/code/data)를 선언한다', (path, method) => {
        const props = envelopeProps(path, method);
        expect(props).toBeDefined();
        expect(props).toHaveProperty('success');
        expect(props).toHaveProperty('code');
        expect(props).toHaveProperty('data');
    });

    it('HLS 스트림은 바이너리라 봉투를 선언하지 않는다', () => {
        const responses = spec.paths?.['/api/v2/feed/videos/stream/{videoId}/{filename}']?.get?.responses;
        expect(responses).toBeDefined();
        const json = responses['200']?.content?.['application/json'];
        expect(json).toBeUndefined();
    });

    /** 실제로 호출 가능한(인증 불필요) feed GET 엔드포인트 */
    const CALLABLE: Array<[string, string]> = [
        ['/api/v2/feed/videos', '/api/v2/feed/videos?page=1&limit=1'],
        ['/api/v2/feed/videos/popular', '/api/v2/feed/videos/popular?limit=1'],
        ['/api/v2/feed/tag/popular', '/api/v2/feed/tag/popular?limit=1'],
        ['/api/v2/feed/tag/suggest', '/api/v2/feed/tag/suggest?q=강'],
        ['/api/v2/feed/tag/search', '/api/v2/feed/tag/search?tag=강아지'],
    ];

    it.each(CALLABLE)('%s: 문서가 선언한 봉투 키 집합이 실응답 키 집합과 정확히 같다', async (specPath, url) => {
        const response = await request(app.getHttpServer()).get(url).expect(200);

        const documented = Object.keys(envelopeProps(specPath, 'get') ?? {}).sort();
        const actual = Object.keys(response.body).sort();

        // 한쪽에만 있는 키가 없어야 한다 — 문서 누락과 실응답 누락을 모두 잡는다
        expect(documented).not.toHaveLength(0);
        expect(actual).toEqual(documented);
    });

    it.each(CALLABLE)('%s: 문서의 message 예시가 실제로 내려가는 message 와 같다', async (specPath, url) => {
        const response = await request(app.getHttpServer()).get(url).expect(200);

        const props = envelopeProps(specPath, 'get') as Record<string, { example?: unknown }>;
        expect(props.message?.example).toBe(response.body.message);
    });

    it.each(CALLABLE)('%s: 문서의 code 예시가 실제 HTTP 상태·본문 code 와 같다', async (specPath, url) => {
        const response = await request(app.getHttpServer()).get(url);

        const props = envelopeProps(specPath, 'get') as Record<string, { example?: unknown }>;
        expect(props.code?.example).toBe(response.status);
        expect(response.body.code).toBe(response.status);
    });
});

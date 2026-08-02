import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';

import { createTestingApp } from '../../testing/test-utils';

/**
 * Swagger 성공 상태 코드가 "실제 HTTP 응답"과 일치하는지 검증한다.
 *
 * 문서끼리만 비교하면(예: 스펙에 201 이 있는지) 코드가 바뀌어도 못 잡는다.
 * 여기서는 엔드포인트를 실제로 호출해 받은 상태 코드를, 같은 엔드포인트의
 * 문서상 성공 코드와 직접 대조한다.
 *
 * 배경: HttpStatusInterceptor 가 POST 201 → 200, PUT/PATCH 204 → 200 으로 통일하는데
 * 5개 엔드포인트가 successStatus: 201 로 문서화돼 있어 실제로 나오지 않는 코드를 광고했다.
 */
describe('Swagger 성공 상태 코드 ↔ 실응답 대조 (e2e)', () => {
    let app: INestApplication;
    let spec: Record<string, any>;

    beforeAll(async () => {
        app = await createTestingApp();
        spec = SwaggerModule.createDocument(
            app,
            new DocumentBuilder().setTitle('t').setVersion('1').build(),
        ) as unknown as Record<string, any>;
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    /** 해당 operation 이 문서화한 2xx 코드 목록 */
    const documentedSuccess = (path: string, method: string): string[] =>
        Object.keys(spec.paths?.[path]?.[method]?.responses ?? {}).filter((c) => c.startsWith('2'));

    /**
     * 실호출 대조는 인증이 걸린 엔드포인트(대부분의 POST)에 닿지 못한다.
     * 그 구간은 "인터셉터가 201/204 를 200 으로 바꾸므로 그 외 2xx 는 발생 불가"라는
     * 불변식으로 문서를 검사해 메운다. 아래 실호출 테스트와 역할이 다르다.
     */
    it('성공 응답을 200 이외의 2xx 로 문서화한 엔드포인트가 없다 (인증 구간 포함)', () => {
        const offenders: string[] = [];

        for (const [path, ops] of Object.entries<any>(spec.paths ?? {})) {
            for (const method of ['get', 'post', 'patch', 'put', 'delete']) {
                if (!ops[method]) continue;
                const notOk = documentedSuccess(path, method).filter((c) => c !== '200');
                if (notOk.length > 0) {
                    offenders.push(`${method.toUpperCase()} ${path} → ${notOk.join(',')}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });

    it('파라미터 없는 GET 전부: 실제 2xx 응답이 문서화된 성공 코드와 일치한다', async () => {
        const mismatches: string[] = [];
        let verified = 0;

        for (const [path, ops] of Object.entries<any>(spec.paths ?? {})) {
            if (!ops.get || path.includes('{')) continue;

            const response = await request(app.getHttpServer()).get(path);
            // 인증/권한으로 막힌 경우 성공 경로를 확인할 수 없으므로 건너뛴다
            if (response.status < 200 || response.status >= 300) continue;

            verified += 1;
            const documented = documentedSuccess(path, 'get');
            if (!documented.includes(String(response.status))) {
                mismatches.push(`GET ${path} → 실제 ${response.status} / 문서 ${documented.join(',') || '없음'}`);
            }
        }

        // 실제로 성공 응답을 받아본 엔드포인트가 있어야 검증이 의미를 가진다
        expect(verified).toBeGreaterThan(10);
        expect(mismatches).toEqual([]);
    }, 120000);

    it('공개 POST: 실제 응답이 201 이 아니라 문서대로 200 이다', async () => {
        // 인증 없이 성공하는 POST. 인터셉터가 201 을 200 으로 정규화하는지 실측한다.
        const cases: Array<{ path: string; body: Record<string, unknown> }> = [
            { path: '/api/v2/auth/check-email', body: { email: 'contract-check@example.com' } },
            { path: '/api/v2/auth/check-nickname', body: { nickname: '계약검증닉' } },
        ];

        const mismatches: string[] = [];
        let verified = 0;

        for (const { path, body } of cases) {
            if (!spec.paths?.[path]?.post) continue;

            const response = await request(app.getHttpServer()).post(path).send(body);
            if (response.status < 200 || response.status >= 300) continue;

            verified += 1;
            expect(response.status).toBe(200);

            const documented = documentedSuccess(path, 'post');
            if (!documented.includes(String(response.status))) {
                mismatches.push(`POST ${path} → 실제 ${response.status} / 문서 ${documented.join(',') || '없음'}`);
            }
        }

        expect(verified).toBeGreaterThan(0);
        expect(mismatches).toEqual([]);
    }, 60000);
});

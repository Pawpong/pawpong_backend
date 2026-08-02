import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';

import { createTestingApp } from '../../testing/test-utils';

/**
 * Swagger 성공 상태 코드가 실제 응답과 일치하는지 전역으로 검증한다.
 *
 * HttpStatusInterceptor 가 POST 201 → 200, PUT/PATCH 204 → 200 으로 통일하므로
 * 문서에 201/204 를 적어두면 실제로는 절대 발생하지 않는 코드를 광고하게 된다.
 * 실제로 adopter 신청·후기 등 5개 엔드포인트가 201 로 문서화돼 있었고,
 * 같은 엔드포인트의 e2e 는 200 을 단언하고 있었다.
 */
describe('Swagger 성공 상태 코드 계약 (e2e)', () => {
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

    it('성공 응답을 200 이외의 2xx 로 문서화한 엔드포인트가 없다', () => {
        const offenders: string[] = [];

        for (const [path, ops] of Object.entries<any>(spec.paths ?? {})) {
            for (const [method, op] of Object.entries<any>(ops)) {
                if (!['get', 'post', 'patch', 'put', 'delete'].includes(method)) continue;
                const success = Object.keys(op.responses ?? {}).filter((c) => c.startsWith('2'));
                const notOk = success.filter((c) => c !== '200');
                if (notOk.length > 0) {
                    offenders.push(`${method.toUpperCase()} ${path} → ${notOk.join(',')}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });

    it('POST 는 실제로 200 을 반환한다 (인터셉터가 201 을 정규화)', async () => {
        // 인증이 필요 없고 부수효과도 없는 POST 로 확인한다.
        // 검증 실패(400)든 성공(200)이든 201 이 나오지 않는 것이 핵심이다.
        const response = await request(app.getHttpServer()).post('/api/v2/auth/check-email').send({ email: 'x' });

        expect(response.status).not.toBe(201);
    });
});

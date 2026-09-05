import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';

import { createTestingApp } from '../../testing/test-utils';

/** 이 테스트가 읽는 OpenAPI 조각만 최소로 정의한다 (라이브러리 타입은 union 이 깊어 검증 의도를 흐린다) */
interface OperationLike {
    responses?: Record<string, unknown>;
}
type PathsLike = Record<string, Record<string, OperationLike>>;

const HTTP_METHODS = ['get', 'post', 'patch', 'put', 'delete'] as const;

/**
 * Swagger 성공 상태 코드가 "실제 HTTP 응답"과 일치하는지 검증한다.
 *
 * 배경: HttpStatusInterceptor 가 POST 201 → 200, PUT/PATCH 204 → 200 으로 통일하므로
 * 문서에 201/204 를 적어두면 실제로 발생하지 않는 코드를 광고하게 된다.
 * 실제로 운영 /docs 에 POST 68건이 201 을 광고하고 있었다.
 */
describe('Swagger 성공 상태 코드 ↔ 실응답 대조 (e2e)', () => {
    let app: INestApplication;
    let paths: PathsLike;

    beforeAll(async () => {
        app = await createTestingApp();
        const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('t').setVersion('1').build());
        paths = document.paths as unknown as PathsLike;
    }, 30000);

    afterAll(async () => {
        await app.close();
    });

    /** 해당 operation 이 문서화한 2xx 코드 목록 */
    const documentedSuccess = (path: string, method: string): string[] =>
        Object.keys(paths[path]?.[method]?.responses ?? {}).filter((code) => code.startsWith('2'));

    /**
     * 실호출 대조는 인증이 걸린 엔드포인트(대부분의 POST)에 닿지 못한다.
     * 그 구간은 "인터셉터가 201/204 를 200 으로 바꾸므로 그 외 2xx 는 발생 불가"라는
     * 불변식으로 문서를 검사해 메운다. 아래 실호출 테스트와 역할이 다르다.
     */
    it('성공 응답을 200 이외의 2xx 로 문서화한 엔드포인트가 없다 (인증 구간 포함)', () => {
        const offenders: string[] = [];

        for (const [path, operations] of Object.entries(paths)) {
            for (const method of HTTP_METHODS) {
                if (!operations[method]) continue;
                const notOk = documentedSuccess(path, method).filter((code) => code !== '200');
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

        for (const [path, operations] of Object.entries(paths)) {
            if (!operations.get || path.includes('{')) continue;

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

    /**
     * @nestjs/swagger CLI 플러그인은 빌드 시점(nest build)에만 동작하며,
     * @HttpCode 가 없는 POST 핸들러마다 프레임워크 기본값인 201 응답을 문서에 추가한다.
     * jest 는 플러그인을 거치지 않아 그 201 이 위 스펙에 나타나지 않으므로,
     * 스펙 검사만으로는 운영 문서의 201 을 절대 잡을 수 없다. 그래서 소스를 직접 검사한다.
     *
     * 근접 검색(±N줄)은 앞뒤 다른 핸들러의 데코레이터를 오인할 수 있어,
     * @Post 가 속한 데코레이터 블록(직전 빈 줄/닫는 중괄호 ~ 메서드 시그니처)만 본다.
     */
    it('모든 @Post 핸들러의 데코레이터 블록에 @HttpCode(HttpStatus.OK) 가 있다', () => {
        const controllers: string[] = [];
        const walk = (dir: string): void => {
            for (const entry of readdirSync(dir)) {
                const full = join(dir, entry);
                if (statSync(full).isDirectory()) walk(full);
                else if (full.endsWith('.controller.ts')) controllers.push(full);
            }
        };
        walk(join(process.cwd(), 'src'));

        const offenders: string[] = [];

        for (const file of controllers) {
            const lines = readFileSync(file, 'utf8').split('\n');

            lines.forEach((line, index) => {
                if (!line.includes('@Post(')) return;

                // 위로: 이 핸들러의 데코레이터 블록 시작점까지 (빈 줄이나 이전 메서드의 끝을 만나면 중단)
                let start = index;
                while (start > 0) {
                    const previous = lines[start - 1].trim();
                    if (previous === '' || previous === '}' || previous.endsWith('{')) break;
                    start -= 1;
                }

                // 아래로: 메서드 시그니처를 만날 때까지 (데코레이터 줄만 블록에 포함)
                let end = index;
                while (end + 1 < lines.length) {
                    const next = lines[end + 1].trim();
                    if (!next.startsWith('@') && next !== '') break;
                    end += 1;
                }

                const block = lines.slice(start, end + 1).join('\n');
                // 표기법(HttpStatus.OK / 200)이 아니라 값이 200 인지를 본다.
                // @HttpCode(201)·@HttpCode(HttpStatus.CREATED) 등은 통과시키지 않는다.
                if (!/@HttpCode\(\s*(?:HttpStatus\.OK|200)\s*\)/.test(block)) {
                    offenders.push(`${file.replace(`${process.cwd()}/`, '')}:${index + 1}`);
                }
            });
        }

        expect(controllers.length).toBeGreaterThan(50);
        expect(offenders).toEqual([]);
    });

    it('공개 POST: 실제 응답이 201 이 아니라 문서대로 200 이다', async () => {
        // 인증 없이 성공하는 POST. 인터셉터가 201 을 200 으로 정규화하는지 실측한다.
        const cases = [
            { path: '/api/v2/auth/check-email', body: { email: 'contract-check@example.com' } },
            { path: '/api/v2/auth/check-nickname', body: { nickname: '계약검증닉' } },
        ];

        const mismatches: string[] = [];
        let verified = 0;

        for (const { path, body } of cases) {
            if (!paths[path]?.post) continue;

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

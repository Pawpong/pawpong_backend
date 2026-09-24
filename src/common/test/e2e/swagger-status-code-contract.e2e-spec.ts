import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';

import { createTestingApp, getAdopterToken, getAdminToken } from '../../testing/test-utils';
import { ManageProductionBackupUseCase } from '../../../api/admin/platform/application/use-cases/manage-production-backup.use-case';

/** 이 테스트가 읽는 OpenAPI 조각만 최소로 정의한다 (라이브러리 타입은 union 이 깊어 검증 의도를 흐린다) */
interface OperationLike {
    responses?: Record<string, unknown>;
}
type PathsLike = Record<string, Record<string, OperationLike>>;

const HTTP_METHODS = ['get', 'post', 'patch', 'put', 'delete'] as const;

// 완료 전 접수만 반환하는 두 경로는 기존 202 계약을 유지하며 아래 HTTP 검사로 별도 증명한다.
const ACCEPTED_ENDPOINTS = [
    {
        path: '/api/v2/account-deletion',
        controller: 'src/api/service/account-deletion/controller/account-deletion.controller.ts',
        postDecorator: '@Post()',
    },
    {
        path: '/api/platform-admin/backups',
        controller: 'src/api/admin/platform/controller/platform-admin-backup.controller.ts',
        postDecorator: "@Post('backups')",
    },
] as const;

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
    // 계약 검증에서 실제 운영 백업 프로세스를 시작하지 않는다.
    const backupRequest = jest.fn().mockResolvedValue({ requestId: 'contract-backup', status: 'pending' });

    beforeAll(async () => {
        app = await createTestingApp([
            { provide: ManageProductionBackupUseCase, useValue: { execute: backupRequest } },
        ]);
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
     * 그 구간은 일반 성공의 200 계약과 명시적 비동기 접수의 202 계약으로 검사한다.
     * 202는 인터셉터의 변환 대상이 아니며 허용한 경로도 아래에서 실호출로 대조한다.
     */
    it('일반 성공은 200, 명시적 비동기 접수만 202로 문서화한다 (인증 구간 포함)', () => {
        const offenders: string[] = [];

        for (const [path, operations] of Object.entries(paths)) {
            for (const method of HTTP_METHODS) {
                if (!operations[method]) continue;
                const expected =
                    method === 'post' && ACCEPTED_ENDPOINTS.some((endpoint) => endpoint.path === path) ? '202' : '200';
                const notOk = documentedSuccess(path, method).filter((code) => code !== expected);
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
    it('모든 @Post 핸들러가 해당 경로의 성공 상태 코드를 명시한다', () => {
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
                const relativeFile = file.replace(`${process.cwd()}/`, '');
                const isAccepted = ACCEPTED_ENDPOINTS.some(
                    (endpoint) => endpoint.controller === relativeFile && endpoint.postDecorator === line.trim(),
                );
                // 다른 경로의 202 또는 모든 경로의 201은 여전히 실패시킨다.
                const expectedCode = isAccepted
                    ? /@HttpCode\(\s*(?:HttpStatus\.ACCEPTED|202)\s*\)/
                    : /@HttpCode\(\s*(?:HttpStatus\.OK|200)\s*\)/;
                if (!expectedCode.test(block)) {
                    offenders.push(`${file.replace(`${process.cwd()}/`, '')}:${index + 1}`);
                }
            });
        }

        expect(controllers.length).toBeGreaterThan(50);
        expect(offenders).toEqual([]);
    });

    it('영구 삭제 접수는 실제 HTTP와 Swagger가 모두 202이며 상태 조회는 200이다', async () => {
        const adopter = await getAdopterToken(app);
        expect(adopter?.token).toBeTruthy();
        const path = '/api/v2/account-deletion';
        const accepted = await request(app.getHttpServer())
            .post(path)
            .set('Authorization', `Bearer ${adopter!.token}`)
            .send({ confirmation: 'DELETE_PERMANENTLY' })
            .expect(202);
        expect(documentedSuccess(path, 'post')).toEqual(['202']);
        const { requestId, receiptToken } = accepted.body.data;
        expect(accepted.body.data.status).toBe('pending');
        const status = await request(app.getHttpServer())
            .post(`${path}/status`)
            .send({ requestId, receiptToken })
            .expect(200);
        expect(documentedSuccess(`${path}/status`, 'post')).toEqual(['200']);
        expect(status.body.data).toMatchObject({ requestId, status: 'pending' });
    });

    it('관리자 백업은 외부 실행 없이도 실제 HTTP와 Swagger의 202 접수 계약을 유지한다', async () => {
        const adminToken = await getAdminToken(app);
        expect(adminToken).toBeTruthy();
        const path = '/api/platform-admin/backups';
        const accepted = await request(app.getHttpServer())
            .post(path)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(202);
        expect(documentedSuccess(path, 'post')).toEqual(['202']);
        expect(backupRequest).toHaveBeenCalledWith(expect.any(String), 'request');
        expect(accepted.body.data.requestId).toBe('contract-backup');
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

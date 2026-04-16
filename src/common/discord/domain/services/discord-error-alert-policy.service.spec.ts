import { DiscordErrorAlertPolicyService } from './discord-error-alert-policy.service';

describe('DiscordErrorAlertPolicyService', () => {
    let service: DiscordErrorAlertPolicyService;

    beforeEach(() => {
        service = new DiscordErrorAlertPolicyService();
    });

    it('5xx 에러는 알림 대상으로 판단해야 한다', () => {
        const result = service.shouldNotify({
            severity: 'critical',
            context: 'AllExceptionsFilter',
            message: 'Internal server error',
            statusCode: 500,
        });

        expect(result).toBe(true);
    });

    it('4xx 에러는 알림 대상에서 제외해야 한다', () => {
        const result = service.shouldNotify({
            severity: 'error',
            context: 'HttpExceptionFilter',
            message: 'Unauthorized',
            statusCode: 401,
        });

        expect(result).toBe(false);
    });

    it('같은 원인의 에러는 동일한 중복 방지 키를 생성해야 한다', () => {
        const baseRequest = {
            severity: 'critical' as const,
            context: 'AllExceptionsFilter',
            message: 'DB connection failed',
            statusCode: 500,
            method: 'GET',
            path: '/api/platform-admin/system-health',
        };

        expect(service.buildDeduplicationKey(baseRequest)).toBe(
            service.buildDeduplicationKey({ ...baseRequest, timestamp: new Date() }),
        );
    });
});

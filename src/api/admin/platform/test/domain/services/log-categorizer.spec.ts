import { LogCategorizerService } from '../../../domain/services/log-categorizer.service';

describe('Operational log classification', () => {
    const service = new LogCategorizerService();
    const now = new Date('2026-09-06T06:30:00Z');
    const entry = (context: string, message: string) => ({
        context,
        message,
        timestamp: now.toISOString(),
        level: 'error',
        deployment: 'blue',
    });
    it('does not treat historical expired tokens and missing routes as incidents', () => {
        const result = service.categorize(
            [
                entry('AllExceptionsFilter', '[GET] /api/profile - 401 - expired'),
                entry('HttpExceptionFilter', '[GET] /favicon.ico - 404 - missing'),
            ],
            now,
        );
        expect(result.issueGroups).toEqual([]);
    });
    it('retains structured server errors and Kafka incidents', () => {
        const result = service.categorize(
            [
                entry('AllExceptionsFilter', JSON.stringify({ event: 'http_failure', statusCode: 500 })),
                entry('ServerKafka', 'connection refused'),
            ],
            now,
        );
        expect(result.issueGroups.map((g) => g.category)).toEqual(
            expect.arrayContaining(['api_error', 'infrastructure']),
        );
        expect(result.overallStatus).toBe('critical');
    });
});

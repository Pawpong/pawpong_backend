import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';
import { AuthSocialRedirectPathService } from '../../../domain/services/auth-social-redirect-path.service';

const logger = { log: jest.fn() } as unknown as CustomLoggerService;

describe('AuthSocialRedirectPathService', () => {
    const service = new AuthSocialRedirectPathService();

    it('originUrl이 없으면 /explore 반환', () => {
        expect(service.resolve(undefined, logger, false)).toBe('/explore');
    });

    it('originUrl에 |가 포함되면 뒤쪽 값을 반환', () => {
        expect(service.resolve('https://example.com|/dashboard', logger, false)).toBe('/dashboard');
    });

    it('쿼리와 해시가 있는 내부 경로를 보존한다', () => {
        expect(service.resolve('https://example.com|/community?sort=latest#comments', logger, false)).toBe(
            '/community?sort=latest#comments',
        );
    });

    it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'community'])(
        '외부 또는 상대 경로 %s는 기본 경로로 치환한다',
        (returnUrl) => {
            expect(service.resolve(`https://example.com|${returnUrl}`, logger, false)).toBe('/explore');
        },
    );

    it('|는 있지만 뒤쪽이 비어있으면 기본값', () => {
        expect(service.resolve('https://example.com|', logger, false)).toBe('/explore');
    });

    it('|가 없으면 기본값', () => {
        expect(service.resolve('https://example.com', logger, false)).toBe('/explore');
    });
});

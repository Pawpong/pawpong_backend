import { AuthSocialRedirectPathService } from '../../../domain/services/auth-social-redirect-path.service';

const logger = { log: jest.fn() } as any;

describe('AuthSocialRedirectPathService', () => {
    const service = new AuthSocialRedirectPathService();

    it('originUrl이 없으면 /explore 반환', () => {
        expect(service.resolve(undefined, logger, false)).toBe('/explore');
    });

    it('originUrl에 |가 포함되면 뒤쪽 값을 반환', () => {
        expect(service.resolve('https://example.com|/dashboard', logger, false)).toBe('/dashboard');
    });

    it('|는 있지만 뒤쪽이 비어있으면 기본값', () => {
        expect(service.resolve('https://example.com|', logger, false)).toBe('/explore');
    });

    it('|가 없으면 기본값', () => {
        expect(service.resolve('https://example.com', logger, false)).toBe('/explore');
    });
});

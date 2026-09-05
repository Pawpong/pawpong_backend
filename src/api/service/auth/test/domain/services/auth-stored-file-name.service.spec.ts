import { AuthStoredFileNameService } from '../../../domain/services/auth-stored-file-name.service';

const logger = { logWarning: jest.fn(), logError: jest.fn() } as any;

describe('AuthStoredFileNameService', () => {
    const service = new AuthStoredFileNameService(logger);

    it('undefined면 undefined 반환', () => {
        expect(service.extract(undefined)).toBeUndefined();
    });

    it('http URL은 pathname을 추출한다 (선행 / 제거)', () => {
        expect(service.extract('https://cdn.example.com/profile/user-1.jpg')).toBe('profile/user-1.jpg');
    });

    it('파일명은 그대로 반환', () => {
        expect(service.extract('profile/user-1.jpg')).toBe('profile/user-1.jpg');
    });

    it('잘못된 URL이면 원본 반환', () => {
        const result = service.extract('not-a-http-url');
        expect(result).toBe('not-a-http-url');
    });
});

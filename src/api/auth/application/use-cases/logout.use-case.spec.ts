import { LogoutUseCase } from './logout.use-case';
import { AuthCommandResponseFactoryService } from '../../domain/services/auth-command-response-factory.service';

describe('로그아웃 유스케이스', () => {
    const authSessionPort = {
        updateRefreshToken: jest.fn(),
    };

    let useCase: LogoutUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new LogoutUseCase(authSessionPort as any, new AuthCommandResponseFactoryService());
    });

    it('입양자/브리더는 refresh token을 제거하고 응답을 반환한다', async () => {
        const result = await useCase.execute('user-id', 'adopter');

        expect(authSessionPort.updateRefreshToken).toHaveBeenCalledWith('user-id', 'adopter', null);
        expect(result.success).toBe(true);
        expect(result.message).toBe('로그아웃되었습니다.');
        expect(result.loggedOutAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('관리자 등 세션 저장 대상이 아니면 token 저장소를 건드리지 않는다', async () => {
        await useCase.execute('admin-id', 'admin');

        expect(authSessionPort.updateRefreshToken).not.toHaveBeenCalled();
    });
});

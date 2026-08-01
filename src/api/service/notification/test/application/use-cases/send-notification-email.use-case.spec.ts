import { SendNotificationEmailUseCase } from '../../../application/use-cases/send-notification-email.use-case';

describe('알림 이메일 발송 유스케이스', () => {
    const notificationEmailPort = {
        send: jest.fn(),
    };

    const useCase = new SendNotificationEmailUseCase(notificationEmailPort as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('이메일 발송에 성공하면 true를 반환한다', () => {
        notificationEmailPort.send.mockReturnValue(true);

        const result = useCase.execute({
            to: 'test@example.com',
            subject: '제목',
            html: '<p>내용</p>',
        });

        expect(result).toBe(true);
    });

    it('이메일 발송에 실패하면 false를 반환한다', () => {
        notificationEmailPort.send.mockReturnValue(false);

        const result = useCase.execute({
            to: 'fail@example.com',
            subject: '제목',
            html: '<p>내용</p>',
        });

        expect(result).toBe(false);
    });

    it('emailData를 포트에 그대로 전달한다', () => {
        notificationEmailPort.send.mockReturnValue(true);
        const emailData = { to: 'user@example.com', subject: '가입 완료', html: '<h1>환영합니다</h1>' };

        useCase.execute(emailData);

        expect(notificationEmailPort.send).toHaveBeenCalledWith(emailData);
    });
});

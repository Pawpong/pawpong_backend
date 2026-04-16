import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { DiscordErrorAlertAdapter } from './discord-error-alert.adapter';
import { CustomLoggerService } from '../../logger/custom-logger.service';

jest.mock('axios');

describe('DiscordErrorAlertAdapter', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    let configService: { get: jest.Mock };
    let logger: jest.Mocked<Pick<CustomLoggerService, 'logWarning' | 'logSuccess'>>;

    beforeEach(() => {
        mockedAxios.post.mockResolvedValue({ data: {} });
        configService = {
            get: jest.fn((key: string) => {
                if (key === 'DISCORD_ERROR_WEBHOOK_URL') return 'https://discord.test/error-webhook';
                return undefined;
            }),
        };
        logger = {
            logWarning: jest.fn(),
            logSuccess: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('critical 에러를 Discord Webhook embed payload로 전송해야 한다', async () => {
        const adapter = new DiscordErrorAlertAdapter(
            configService as unknown as ConfigService,
            logger as unknown as CustomLoggerService,
        );

        await adapter.sendCriticalErrorAlert({
            severity: 'critical',
            context: 'AllExceptionsFilter',
            message: 'DB connection failed',
            statusCode: 500,
            method: 'GET',
            path: '/api/test',
            timestamp: new Date('2026-04-16T00:00:00.000Z'),
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://discord.test/error-webhook',
            expect.objectContaining({
                embeds: [
                    expect.objectContaining({
                        title: '🚨 Critical 서버 에러',
                        color: 0xf44336,
                        description: 'DB connection failed',
                        timestamp: '2026-04-16T00:00:00.000Z',
                    }),
                ],
            }),
        );
        expect(logger.logSuccess).toHaveBeenCalled();
    });

    it('에러 웹훅 URL이 없으면 HTTP 요청 없이 경고 로그만 남겨야 한다', async () => {
        configService.get.mockReturnValue(undefined);
        const adapter = new DiscordErrorAlertAdapter(
            configService as unknown as ConfigService,
            logger as unknown as CustomLoggerService,
        );

        await adapter.sendCriticalErrorAlert({
            severity: 'critical',
            context: 'AllExceptionsFilter',
            message: 'DB connection failed',
        });

        expect(mockedAxios.post).not.toHaveBeenCalled();
        expect(logger.logWarning).toHaveBeenCalledWith(
            'sendCriticalErrorAlert',
            '디스코드 에러 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
        );
    });
});

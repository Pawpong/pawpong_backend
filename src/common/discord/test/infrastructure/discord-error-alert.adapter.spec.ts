/* eslint @typescript-eslint/unbound-method: "off" -- Jest mock 호출 이력 matcher에 메서드 참조를 전달함. */
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { DiscordErrorAlertAdapter } from '../../infrastructure/discord-error-alert.adapter';
import { CustomLoggerService } from '../../../logger/custom-logger.service';

jest.mock('axios');

describe('DiscordErrorAlertAdapter', () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;

    let configService: { get: jest.Mock };
    let logger: jest.Mocked<Pick<CustomLoggerService, 'logWarning' | 'logSuccess'>>;

    beforeEach(() => {
        mockedAxios.post.mockResolvedValue({ data: {} });
        configService = {
            get: jest.fn((key: string) => {
                if (key === 'NODE_ENV') return 'production';
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
                        title: '[production] 🚨 Critical 서버 에러',
                        color: 0xf44336,
                        description: 'DB connection failed',
                        timestamp: '2026-04-16T00:00:00.000Z',
                    }),
                ],
            }),
            { timeout: 8000, maxRedirects: 0 },
        );
        expect(logger.logSuccess).toHaveBeenCalled();
    });

    it('에러 웹훅 URL이 없으면 HTTP 요청 없이 경고 로그만 남겨야 한다', async () => {
        configService.get.mockReturnValue(undefined);
        const adapter = new DiscordErrorAlertAdapter(
            configService as unknown as ConfigService,
            logger as unknown as CustomLoggerService,
        );

        await expect(
            adapter.sendCriticalErrorAlert({
                severity: 'critical',
                context: 'AllExceptionsFilter',
                message: 'DB connection failed',
            }),
        ).rejects.toThrow('discord_error_webhook_not_configured');

        expect(mockedAxios.post).not.toHaveBeenCalled();
        expect(logger.logWarning).toHaveBeenCalledWith(
            'sendCriticalErrorAlert',
            '디스코드 에러 웹훅이 설정되지 않아 알림을 보낼 수 없습니다.',
        );
    });

    it('로컬 환경(APP_ENV=local)은 개발 서버 웹훅으로 보내지 않는다', async () => {
        // 개발자 PC 오류가 개발 서버 오류 방에 섞이면 실제 dev 장애를 가린다.
        configService.get.mockImplementation((key: string) => {
            if (key === 'APP_ENV') return 'local';
            if (key === 'NODE_ENV') return 'development';
            if (key === 'DISCORD_DEV_ERROR_WEBHOOK_URL') return 'https://discord.test/dev-error-webhook';
            if (key === 'DISCORD_ERROR_WEBHOOK_URL') return 'https://discord.test/error-webhook';
            return undefined;
        });

        const adapter = new DiscordErrorAlertAdapter(
            configService as unknown as ConfigService,
            logger as unknown as CustomLoggerService,
        );

        await expect(
            adapter.sendCriticalErrorAlert({
                severity: 'critical',
                context: 'Bootstrap',
                message: 'Kafka chat consumer 시작 실패',
            }),
        ).rejects.toThrow('discord_error_webhook_not_configured');

        expect(mockedAxios.post).not.toHaveBeenCalled();
        // 알림 대상 환경이 아니므로 설정 누락 경고도 남기지 않는다
        expect(logger.logWarning).not.toHaveBeenCalled();
    });

    it('개발 서버(APP_ENV=development)는 개발 오류 웹훅으로 보낸다', async () => {
        configService.get.mockImplementation((key: string) => {
            if (key === 'APP_ENV') return 'development';
            if (key === 'DISCORD_DEV_ERROR_WEBHOOK_URL') return 'https://discord.test/dev-error-webhook';
            return undefined;
        });

        const adapter = new DiscordErrorAlertAdapter(
            configService as unknown as ConfigService,
            logger as unknown as CustomLoggerService,
        );

        await adapter.sendCriticalErrorAlert({
            severity: 'critical',
            context: 'Bootstrap',
            message: 'Kafka chat consumer 시작 실패',
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://discord.test/dev-error-webhook',
            expect.objectContaining({
                embeds: [expect.objectContaining({ title: '[development] 🚨 Critical 서버 에러' })],
            }),
            { timeout: 8000, maxRedirects: 0 },
        );
    });
});

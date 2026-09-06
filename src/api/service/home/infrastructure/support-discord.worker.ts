import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { SupportEventRepository } from '../repository/support-event.repository';
import type { SupportEventRecord } from '../../../../schema/support-event.schema';

/** DB outbox: 재시작·웹후크 장애에도 미전달 접수를 유지한다. */
@Injectable()
export class SupportDiscordWorker implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(SupportDiscordWorker.name);
    private timer?: ReturnType<typeof setInterval>;
    private running = false;

    constructor(
        private readonly repository: SupportEventRepository,
        private readonly config: ConfigService,
    ) {}

    onModuleInit() {
        if ((this.config.get('APP_ENV') || this.config.get('NODE_ENV')) !== 'production') return;
        this.timer = setInterval(() => {
            void this.flush();
        }, 15_000);
        this.timer.unref();
        void this.flush();
    }
    onModuleDestroy() {
        if (this.timer) clearInterval(this.timer);
    }

    async flush(): Promise<void> {
        if (this.running || (this.config.get('APP_ENV') || this.config.get('NODE_ENV')) !== 'production') return;
        this.running = true;
        try {
            for (let i = 0; i < 10; i++) {
                const token = randomUUID();
                const event = await this.repository.claim('production', token);
                if (!event) break;
                try {
                    const url = this.config.get<string>(
                        event.kind === 'ai_error' ? 'DISCORD_ERROR_WEBHOOK_URL' : 'DISCORD_SUPPORT_WEBHOOK_URL',
                    );
                    if (!url) throw new Error('support_webhook_not_configured');
                    await axios.post(url, this.payload(event), { timeout: 8_000, maxRedirects: 0 });
                    await this.repository.delivered(event.eventId, token);
                } catch {
                    // Axios 오류에는 웹후크 토큰/요청 본문이 포함될 수 있어 원본을 출력하지 않는다.
                    this.logger.warn(
                        JSON.stringify({
                            event: 'support_delivery_retry',
                            eventId: event.eventId,
                            attempt: event.attempts,
                        }),
                    );
                    await this.repository.retry(event.eventId, token, event.attempts);
                }
            }
        } catch {
            this.logger.error('support_outbox_unavailable');
        } finally {
            this.running = false;
        }
    }

    payload(event: SupportEventRecord) {
        const titles: Record<string, string> = {
            feedback: '📨 사용자 피드백 접수',
            ai_no_match: '🗂️ AI Q&A · 관련 FAQ 없음',
            ai_error: '⚠️ AI Q&A · 답변 실패',
        };
        // 질문 원문은 AI 알림에 포함하지 않으며, 피드백도 이메일·전화·인증 정보를 마스킹한다.
        const preview = (event.message || '')
            .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[이메일 숨김]')
            .replace(/(?:\+?82[- .]?)?0?1[016789][- .]?\d{3,4}[- .]?\d{4}/g, '[전화번호 숨김]')
            .replace(/(?:bearer\s+|sk-)[a-z0-9_.-]+/gi, '[인증정보 숨김]')
            .replace(/https?:\/\/\S+/gi, '[링크 숨김]')
            .replace(/[<>`*_~|@]/g, '')
            .slice(0, 600);
        return {
            allowed_mentions: { parse: [] },
            embeds: [
                {
                    title: titles[event.kind],
                    description: preview || '질문 원문 없이 처리 결과만 기록함.',
                    color: event.kind === 'ai_error' ? 0xd63d4a : 0xad651d,
                    fields: [
                        { name: '접수번호', value: event.eventId },
                        { name: '환경', value: event.environment, inline: true },
                        {
                            name: '처리 상태',
                            value:
                                (
                                    { open: '접수', in_progress: '처리 중', resolved: '처리 완료' } as Record<
                                        string,
                                        string
                                    >
                                )[event.status] || '접수',
                            inline: true,
                        },
                        { name: '담당자', value: event.assigneeId || '미지정', inline: true },
                        { name: '변경 버전', value: String(event.revision || 0), inline: true },
                        { name: '이용자 유형', value: event.userType, inline: true },
                        ...(event.durationMs === undefined
                            ? []
                            : [{ name: '처리시간', value: event.durationMs + 'ms', inline: true }]),
                    ],
                    url:
                        (this.config.get<string>('ADMIN_URL') || 'https://admin.pawpong.kr') +
                        '/support?receipt=' +
                        encodeURIComponent(event.eventId),
                    footer: { text: 'Pawpong · 제목을 눌러 담당자와 처리 상태 관리함' },
                    timestamp: new Date().toISOString(),
                },
            ],
        };
    }
}

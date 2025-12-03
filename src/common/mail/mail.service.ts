import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * 이메일 발송 서비스
 *
 * Nodemailer를 사용한 이메일 발송 기능 제공
 * Gmail SMTP 또는 기타 SMTP 서버 지원
 */
@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.initializeTransporter();
    }

    private initializeTransporter(): void {
        const host = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
        const port = this.configService.get<number>('MAIL_PORT', 587);
        const user = this.configService.get<string>('MAIL_USER');
        const pass = this.configService.get<string>('MAIL_PASSWORD');

        if (!user || !pass) {
            this.logger.warn('메일 설정이 누락되었습니다. 이메일 발송이 비활성화됩니다.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });

        this.logger.log('메일 서비스가 초기화되었습니다.');
    }

    /**
     * 이메일 발송
     *
     * @param options 메일 옵션 (수신자, 제목, HTML 본문)
     * @returns 발송 성공 여부
     */
    async sendMail(options: MailOptions): Promise<boolean> {
        if (!this.transporter) {
            this.logger.warn('메일 트랜스포터가 초기화되지 않았습니다. 이메일 발송을 건너뜁니다.');
            return false;
        }

        try {
            const fromName = this.configService.get<string>('MAIL_FROM_NAME', '포퐁');
            const fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL', 'pawriendsofficial@gmail.com');

            await this.transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            this.logger.log(`이메일 발송 성공: ${options.to}`);
            return true;
        } catch (error) {
            this.logger.error(`이메일 발송 실패: ${options.to}`, error);
            return false;
        }
    }
}

import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adopter, AdopterDocument } from '../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../schema/breeder.schema';
import { PhoneWhitelist, PhoneWhitelistDocument } from '../../schema/phone-whitelist.schema';
import { AlimtalkService } from '../../common/alimtalk/alimtalk.service';

interface VerificationCode {
    phone: string;
    code: string;
    expiresAt: Date;
    attempts: number;
    verified: boolean;
}

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private verificationCodes: Map<string, VerificationCode> = new Map();
    private readonly MAX_ATTEMPTS = 5;
    private readonly CODE_EXPIRY_MINUTES = 3;

    constructor(
        private readonly alimtalkService: AlimtalkService,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(PhoneWhitelist.name) private phoneWhitelistModel: Model<PhoneWhitelistDocument>,
    ) {}

    /**
     * 전화번호가 화이트리스트에 있는지 확인 (DB 조회)
     */
    private async isPhoneWhitelisted(phoneNumber: string): Promise<boolean> {
        const whitelist = await this.phoneWhitelistModel
            .findOne({ phoneNumber, isActive: true })
            .lean()
            .exec();
        return !!whitelist;
    }

    async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
        const normalizedPhone = this.normalizePhoneNumber(phone);

        // 전화번호 화이트리스트 체크 (DB 조회, 중복 허용)
        const isWhitelisted = await this.isPhoneWhitelisted(normalizedPhone);

        // 전화번호 중복 체크 (화이트리스트에 없는 경우만)
        if (!isWhitelisted) {
            const existingAdopter = await this.adopterModel.findOne({ phoneNumber: normalizedPhone }).exec();
            if (existingAdopter) {
                throw new BadRequestException('이미 등록된 전화번호입니다.');
            }

            const existingBreeder = await this.breederModel.findOne({ phone: normalizedPhone }).exec();
            if (existingBreeder) {
                throw new BadRequestException('이미 등록된 전화번호입니다.');
            }
        }

        const existingCode = this.verificationCodes.get(normalizedPhone);
        if (existingCode && !this.isExpired(existingCode.expiresAt)) {
            const remainingTime = Math.ceil((existingCode.expiresAt.getTime() - Date.now()) / 1000 / 60);
            throw new BadRequestException(
                `이미 발송된 인증코드가 있습니다. ${remainingTime}분 후에 재발송 가능합니다.`,
            );
        }

        const verificationCode = this.generateVerificationCode();
        const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

        try {
            // 1. 카카오 알림톡으로 인증번호 발송 시도
            const alimtalkResult = await this.alimtalkService.sendVerificationCode(normalizedPhone, verificationCode);

            if (alimtalkResult.success) {
                this.logger.log(`[sendVerificationCode] 알림톡 인증번호 발송 성공: ${normalizedPhone}`);
            } else {
                // 알림톡 실패 시 로그 기록 (SMS fallback은 알림톡 서비스에서 자동 처리)
                this.logger.warn(
                    `[sendVerificationCode] 알림톡 발송 실패, SMS fallback 시도됨: ${alimtalkResult.error}`,
                );
            }

            // 인증코드 저장 (알림톡/SMS 발송 성공 여부와 관계없이)
            this.verificationCodes.set(normalizedPhone, {
                phone: normalizedPhone,
                code: verificationCode,
                expiresAt,
                attempts: 0,
                verified: false,
            });

            return {
                success: true,
                message: '인증번호가 발송되었습니다.',
            };
        } catch (error) {
            this.logger.error(`[sendVerificationCode] 인증번호 발송 실패: ${error.message}`);
            throw new InternalServerErrorException('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    async verifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        const verification = this.verificationCodes.get(normalizedPhone);

        if (!verification) {
            throw new BadRequestException('인증번호를 먼저 요청해주세요.');
        }

        if (verification.verified) {
            throw new BadRequestException('이미 인증이 완료되었습니다.');
        }

        if (this.isExpired(verification.expiresAt)) {
            this.verificationCodes.delete(normalizedPhone);
            throw new BadRequestException('인증번호가 만료되었습니다. 다시 요청해주세요.');
        }

        verification.attempts++;

        if (verification.attempts > this.MAX_ATTEMPTS) {
            this.verificationCodes.delete(normalizedPhone);
            throw new BadRequestException('인증 시도 횟수를 초과했습니다. 다시 요청해주세요.');
        }

        if (verification.code !== code) {
            throw new BadRequestException(
                `인증번호가 일치하지 않습니다. (${verification.attempts}/${this.MAX_ATTEMPTS})`,
            );
        }

        verification.verified = true;

        return {
            success: true,
            message: '전화번호 인증이 완료되었습니다.',
        };
    }

    isPhoneVerified(phone: string): boolean {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        const verification = this.verificationCodes.get(normalizedPhone);

        return verification?.verified === true && !this.isExpired(verification.expiresAt);
    }

    clearVerification(phone: string): void {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        this.verificationCodes.delete(normalizedPhone);
    }

    private generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private normalizePhoneNumber(phone: string): string {
        const cleaned = phone.replace(/[^0-9]/g, '');

        if (!cleaned.match(/^01[0-9]{8,9}$/)) {
            throw new BadRequestException('올바른 전화번호 형식이 아닙니다.');
        }

        return cleaned;
    }

    private isExpired(expiresAt: Date): boolean {
        return expiresAt.getTime() < Date.now();
    }

    cleanupExpiredCodes(): void {
        const now = Date.now();
        for (const [phone, verification] of this.verificationCodes.entries()) {
            if (verification.expiresAt.getTime() < now) {
                this.verificationCodes.delete(phone);
            }
        }
    }
}

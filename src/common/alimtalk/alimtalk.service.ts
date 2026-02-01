import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CoolsmsMessageService from 'coolsms-node-sdk';

import {
    AlimtalkTemplate as AlimtalkTemplateSchema,
    AlimtalkTemplateDocument,
} from '../../schema/alimtalk-template.schema';

import { AlimtalkTemplateCodeEnum } from '../../common/enum/alimtalk-template-code.enum';

/**
 * 템플릿 캐시용 인터페이스
 */
interface CachedTemplate {
    templateCode: string;
    templateId: string;
    name: string;
    description?: string;
    requiredVariables: string[];
    fallbackToSms: boolean;
    isActive: boolean;
    reviewStatus: string;
    buttons?: AlimtalkButton[];
}

/**
 * 알림톡 발송 결과 인터페이스
 */
export interface AlimtalkResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * 알림톡 버튼 인터페이스
 */
export interface AlimtalkButton {
    buttonType: string; // WL(웹링크), AL(앱링크), BK(봇키워드), MD(메시지전달), BC(상담톡전환), BT(봇전환), AC(채널추가)
    buttonName: string;
    linkMo?: string;
    linkPc?: string;
    linkAnd?: string;
    linkIos?: string;
}

/**
 * 알림톡 발송 옵션
 */
export interface AlimtalkOptions {
    /** 수신자 전화번호 */
    to: string;
    /** 템플릿 ID (솔라피에 등록된 템플릿) */
    templateId: string;
    /** 템플릿 변수 (#{변수명} 형식으로 치환됨) */
    variables?: Record<string, string>;
    /** 알림톡 실패 시 SMS로 대체 발송 여부 */
    fallbackToSms?: boolean;
    /** 알림톡 버튼 (템플릿에 버튼이 있으면 필수) */
    buttons?: AlimtalkButton[];
}

@Injectable()
export class AlimtalkService implements OnModuleInit {
    private readonly messageService: CoolsmsMessageService;
    private readonly logger = new Logger(AlimtalkService.name);
    private readonly senderPhone: string;
    private readonly pfId: string; // 카카오 채널 ID

    // 템플릿 캐시 (DB 조회 최소화)
    private templateCache: Map<string, CachedTemplate> = new Map();

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(AlimtalkTemplateSchema.name)
        private readonly alimtalkTemplateModel: Model<AlimtalkTemplateDocument>,
    ) {
        const apiKey = this.configService.get<string>('COOLSMS_API_KEY');
        const apiSecret = this.configService.get<string>('COOLSMS_API_SECRET');
        this.senderPhone = this.configService.get<string>('COOLSMS_SENDER_PHONE') || '';
        this.pfId = this.configService.get<string>('KAKAO_CHANNEL_ID') || '';

        if (apiKey && apiSecret) {
            this.messageService = new CoolsmsMessageService(apiKey, apiSecret);
            this.logger.log('[AlimtalkService] CoolSMS 서비스 초기화 완료');
        } else {
            this.logger.warn('[AlimtalkService] CoolSMS API 키가 설정되지 않았습니다.');
        }
    }

    /**
     * 모듈 초기화 시 템플릿 캐시 로드
     */
    async onModuleInit() {
        await this.refreshTemplateCache();
    }

    /**
     * 템플릿 캐시 갱신 (DB에서 모든 활성 템플릿 로드)
     */
    async refreshTemplateCache(): Promise<void> {
        try {
            const templates = await this.alimtalkTemplateModel.find({ isActive: true }).lean().exec();

            this.templateCache.clear();
            for (const template of templates) {
                this.templateCache.set(template.templateCode, {
                    templateCode: template.templateCode,
                    templateId: template.templateId,
                    name: template.name,
                    description: template.description,
                    requiredVariables: template.requiredVariables,
                    fallbackToSms: template.fallbackToSms,
                    isActive: template.isActive,
                    reviewStatus: template.reviewStatus,
                    buttons: template.buttons,
                });
            }

            this.logger.log(`[refreshTemplateCache] 템플릿 캐시 갱신 완료: ${templates.length}개`);
        } catch (error) {
            this.logger.error(`[refreshTemplateCache] 템플릿 캐시 갱신 실패: ${error.message}`);
        }
    }

    /**
     * 템플릿 코드로 템플릿 정보 조회 (캐시 우선)
     */
    private async getTemplateByCode(templateCode: string): Promise<CachedTemplate | null> {
        // 캐시에서 먼저 조회
        if (this.templateCache.has(templateCode)) {
            return this.templateCache.get(templateCode)!;
        }

        // 캐시에 없으면 DB 조회
        const template = await this.alimtalkTemplateModel.findOne({ templateCode, isActive: true }).lean().exec();

        if (template) {
            const cached: CachedTemplate = {
                templateCode: template.templateCode,
                templateId: template.templateId,
                name: template.name,
                description: template.description,
                requiredVariables: template.requiredVariables,
                fallbackToSms: template.fallbackToSms,
                isActive: template.isActive,
                reviewStatus: template.reviewStatus,
                buttons: template.buttons,
            };
            this.templateCache.set(templateCode, cached);
            return cached;
        }

        return null;
    }

    /**
     * 카카오 알림톡 발송
     * @param options 발송 옵션
     * @returns 발송 결과
     */
    async send(options: AlimtalkOptions): Promise<AlimtalkResult> {
        const { to, templateId, variables = {}, fallbackToSms = true } = options;

        if (!this.messageService) {
            this.logger.error('[send] CoolSMS 서비스가 초기화되지 않았습니다.');
            return { success: false, error: 'CoolSMS 서비스가 초기화되지 않았습니다.' };
        }

        if (!this.pfId) {
            this.logger.error('[send] 카카오 채널 ID가 설정되지 않았습니다.');
            return { success: false, error: '카카오 채널 ID가 설정되지 않았습니다.' };
        }

        try {
            const normalizedPhone = this.normalizePhoneNumber(to);

            // 디버깅: 전송할 변수 로그
            this.logger.log(
                `[send] 전송 변수 확인 - templateId: ${templateId}, variables: ${JSON.stringify(variables)}`,
            );

            // 알림톡 발송 요청
            // 중요: 강조 타입 템플릿은 템플릿 자체에 이미 강조 구조가 설정되어 있어서
            // API 호출 시에는 variables만 전달하면 됩니다.
            const kakaoOptions: any = {
                pfId: this.pfId,
                templateId: templateId,
                variables: variables,
                adFlag: false, // 광고성 메시지 여부 (알림톡은 false)
                disableSms: !fallbackToSms, // true면 SMS 대체 발송 안함
            };

            const response = await this.messageService.sendOne({
                to: normalizedPhone,
                from: this.senderPhone,
                type: 'ATA', // 알림톡 타입 명시
                autoTypeDetect: false, // 알림톡 타입 자동 감지 비활성화
                kakaoOptions: kakaoOptions,
            });

            this.logger.log(`[send] 알림톡 발송 성공: ${normalizedPhone}, templateId: ${templateId}`);

            return {
                success: true,
                messageId: response.messageId || response.groupId,
            };
        } catch (error) {
            this.logger.error(`[send] 알림톡 발송 실패: ${error.message}`, error.stack);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * 템플릿 코드로 알림톡 발송 (MongoDB에서 템플릿 조회)
     * @param to 수신자 전화번호
     * @param templateCode 템플릿 코드 (예: 'VERIFICATION_CODE')
     * @param variables 템플릿 변수
     */
    async sendByTemplate(
        to: string,
        templateCode: AlimtalkTemplateCodeEnum | string,
        variables: Record<string, string> = {},
    ): Promise<AlimtalkResult> {
        const template = await this.getTemplateByCode(templateCode);

        if (!template) {
            this.logger.error(`[sendByTemplate] 템플릿을 찾을 수 없음: ${templateCode}`);
            return { success: false, error: `템플릿을 찾을 수 없습니다: ${templateCode}` };
        }

        if (template.reviewStatus !== 'approved') {
            this.logger.warn(
                `[sendByTemplate] 검수되지 않은 템플릿 발송 스킵: ${templateCode} (${template.reviewStatus})`,
            );
            // 검수 중인 템플릿은 알림톡 발송하지 않음 (이메일만 발송됨)
            return { success: false, error: `템플릿이 검수 중입니다: ${template.reviewStatus}` };
        }

        return this.send({
            to,
            templateId: template.templateId,
            variables,
            fallbackToSms: template.fallbackToSms,
        });
    }

    // ============================================
    // 비즈니스 로직별 편의 메서드
    // ============================================

    /**
     * 회원가입 인증번호 알림톡 발송
     * 중요: CoolSMS/Solapi API는 변수 키를 "#{변수명}" 형식으로 전달해야 합니다.
     */
    async sendVerificationCode(phone: string, code: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(phone, AlimtalkTemplateCodeEnum.VERIFICATION_CODE, {
            '#{인증번호}': code,
        });
    }

    /**
     * 브리더 입점 승인 알림톡 발송
     * 템플릿에 변수 없음
     */
    async sendBreederApproved(phone: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(phone, AlimtalkTemplateCodeEnum.BREEDER_APPROVED, {});
    }

    /**
     * 브리더 입점 반려 알림톡 발송
     * 템플릿에 변수 없음 - 자세한 반려 사유는 이메일로 안내
     */
    async sendBreederRejected(phone: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(phone, AlimtalkTemplateCodeEnum.BREEDER_REJECTED, {});
    }

    /**
     * 상담 신청 알림톡 발송 (브리더에게)
     * 템플릿에 변수가 없으므로 고정 메시지로 발송
     */
    async sendConsultationRequest(breederPhone: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(breederPhone, AlimtalkTemplateCodeEnum.CONSULTATION_REQUEST, {});
    }

    /**
     * 상담 완료 알림톡 발송 (입양자에게)
     * 템플릿: #{브리더명}님과의 입양 상담은 어떠셨나요?
     * 중요: CoolSMS/Solapi API는 변수 키를 "#{변수명}" 형식으로 전달해야 합니다.
     */
    async sendConsultationComplete(adopterPhone: string, breederName: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(adopterPhone, AlimtalkTemplateCodeEnum.CONSULTATION_COMPLETE, {
            '#{브리더명}': breederName,
        });
    }

    /**
     * 새 후기 등록 알림톡 발송 (브리더에게)
     */
    async sendNewReview(breederPhone: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(breederPhone, AlimtalkTemplateCodeEnum.NEW_REVIEW, {});
    }

    /**
     * 서류 미제출 브리더 계정 활성화 알림톡 발송
     * 중요: CoolSMS/Solapi API는 변수 키를 "#{변수명}" 형식으로 전달해야 합니다.
     */
    async sendDocumentReminder(breederPhone: string, breederName: string): Promise<AlimtalkResult> {
        return this.sendByTemplate(breederPhone, AlimtalkTemplateCodeEnum.DOCUMENT_REMINDER, {
            '#{브리더명}': breederName,
        });
    }

    /**
     * 전화번호 정규화
     */
    private normalizePhoneNumber(phone: string): string {
        // 숫자만 추출
        const cleaned = phone.replace(/[^0-9]/g, '');

        // 국제번호 형식이면 그대로, 아니면 010 형식 확인
        if (cleaned.startsWith('82')) {
            return cleaned;
        }

        if (!cleaned.match(/^01[0-9]{8,9}$/)) {
            throw new Error('올바른 전화번호 형식이 아닙니다.');
        }

        return cleaned;
    }
}

import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import {
    VerificationStatus,
    AdminAction,
    AdminTargetType,
    NotificationType,
    RecipientType,
} from '../../../common/enum/user.enum';

import { MailTemplateService } from '../../../common/mail/mail-template.service';
import { MailService } from '../../../common/mail/mail.service';
import { NotificationService } from '../../../api/notification/notification.service';

import { BreederSuspendRequestDto } from './dto/request/breeder-suspend-request.dto';
import { BreederRemindRequestDto } from './dto/request/breeder-remind-request.dto';
import { BreederSuspendResponseDto } from './dto/response/breeder-suspend-response.dto';
import { BreederRemindResponseDto } from './dto/response/breeder-remind-response.dto';
import { SetTestAccountResponseDto } from './dto/response/set-test-account-response.dto';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

/**
 * 브리더 관리 Admin 서비스
 *
 * 브리더 도메인에 대한 관리자 기능을 제공합니다:
 * - 브리더 제재 처리 (정지/해제)
 * - 리마인드 알림 발송
 * - 테스트 계정 설정
 *
 * 분리된 기능:
 * - 브리더 인증 관리 → BreederVerificationAdminService
 * - 브리더 레벨 변경 → BreederVerificationAdminService
 */
@Injectable()
export class BreederAdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        private readonly mailTemplateService: MailTemplateService,
        private readonly mailService: MailService,
        private readonly notificationService: NotificationService,
    ) {}

    /**
     * 관리자 활동 로그 기록
     * @private
     */
    private async logAdminActivity(
        adminId: string,
        action: AdminAction,
        targetType: AdminTargetType,
        targetId: string,
        targetName?: string,
        description?: string,
    ): Promise<void> {
        const admin = await this.adminModel.findById(adminId);
        if (admin) {
            const logEntry = {
                logId: randomUUID(),
                action,
                targetType,
                targetId,
                targetName,
                description: description || `${action} performed on ${targetType} ${targetName || targetId}`,
                performedAt: new Date(),
            };
            admin.activityLogs.push(logEntry);
            await admin.save();
        }
    }

    /**
     * 브리더 제재 처리 (영구정지)
     *
     * 브리더 계정을 영구정지 처리하고 알림을 발송합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param suspendData 제재 데이터
     * @returns 제재 처리 결과
     */
    async suspendBreeder(
        adminId: string,
        breederId: string,
        suspendData: BreederSuspendRequestDto,
    ): Promise<BreederSuspendResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        if (breeder.accountStatus === 'suspended') {
            throw new BadRequestException('이미 정지된 계정입니다.');
        }

        breeder.accountStatus = 'suspended';
        breeder.suspensionReason = suspendData.reason;
        breeder.suspendedAt = new Date();
        await breeder.save();

        await this.logAdminActivity(
            adminId,
            AdminAction.SUSPEND_USER,
            AdminTargetType.BREEDER,
            breederId,
            breeder.nickname,
            `Suspended: ${suspendData.reason}`,
        );

        // 브리더에게 이메일 발송 (비동기, 결과를 기다리지 않음)
        if (breeder.emailAddress) {
            const emailContent = this.mailTemplateService.getBreederSuspensionEmail(
                breeder.nickname,
                suspendData.reason,
            );

            this.mailService
                .sendMail({
                    to: breeder.emailAddress,
                    subject: emailContent.subject,
                    html: emailContent.html,
                })
                .catch((error) => console.error('브리더 정지 이메일 발송 실패:', error));
        }

        return {
            breederId,
            reason: suspendData.reason,
            suspendedAt: new Date(),
            notificationSent: true, // 발송 시작됨
        };
    }

    /**
     * 브리더 계정 정지 해제
     *
     * 정지된 브리더 계정을 활성화하고 알림을 발송합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @returns 정지 해제 처리 결과
     */
    async unsuspendBreeder(adminId: string, breederId: string): Promise<BreederSuspendResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        if (breeder.accountStatus !== 'suspended') {
            throw new BadRequestException('정지 상태가 아닌 계정입니다.');
        }

        breeder.accountStatus = 'active';
        breeder.suspensionReason = undefined;
        breeder.suspendedAt = undefined;
        await breeder.save();

        await this.logAdminActivity(
            adminId,
            AdminAction.ACTIVATE_USER,
            AdminTargetType.BREEDER,
            breederId,
            breeder.nickname,
            'Account unsuspended',
        );

        // 브리더에게 정지 해제 이메일 발송 (비동기, 결과를 기다리지 않음)
        if (breeder.emailAddress) {
            const emailContent = this.mailTemplateService.getBreederUnsuspensionEmail(breeder.nickname);

            this.mailService
                .sendMail({
                    to: breeder.emailAddress,
                    subject: emailContent.subject,
                    html: emailContent.html,
                })
                .catch((error) => console.error('브리더 정지 해제 이메일 발송 실패:', error));
        }

        return {
            breederId,
            reason: undefined,
            suspendedAt: undefined,
            notificationSent: true, // 발송 시작됨
        };
    }

    /**
     * 리마인드 알림 발송
     *
     * 브리더들에게 리마인드 알림을 발송합니다.
     * - DOCUMENT_REMINDER: 서류 미제출 브리더 대상 (입점 심사 독촉)
     * - PROFILE_COMPLETION_REMINDER: 프로필 미완성 브리더 대상 (프로필 완성 독려)
     *
     * @param adminId 관리자 고유 ID
     * @param remindData 리마인드 데이터
     * @returns 발송 결과
     */
    async sendRemindNotifications(
        adminId: string,
        remindData: BreederRemindRequestDto,
    ): Promise<BreederRemindResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        const successIds: string[] = [];
        const failIds: string[] = [];

        for (const breederId of remindData.breederIds) {
            try {
                const breeder = await this.breederModel.findById(breederId);
                if (!breeder) {
                    failIds.push(breederId);
                    continue;
                }

                // remindType에 따라 다른 알림 발송
                if (remindData.remindType === 'document_reminder') {
                    // [4] 입점 심사 독촉 알림
                    // 서류 미제출 상태(PENDING) 확인
                    if (breeder.verification?.status === VerificationStatus.PENDING) {
                        // 이메일 템플릿 생성
                        const emailContent = this.mailTemplateService.getDocumentReminderEmail(
                            breeder.nickname || '브리더',
                        );

                        console.log('📧 [입점 심사 독촉] 이메일 발송 준비:', {
                            breederId,
                            breederName: breeder.nickname,
                            emailAddress: breeder.emailAddress,
                            hasEmailContent: !!emailContent,
                            subject: emailContent?.subject,
                        });

                        // 서비스 알림 빌더 (입점 서류 수정 화면으로 이동하도록 설정)
                        const builder = this.notificationService
                            .to(breederId, RecipientType.BREEDER)
                            .type(NotificationType.DOCUMENT_REMINDER)
                            .title('📄 브리더 입점 절차가 아직 완료되지 않았어요!')
                            .content('필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.')
                            .targetUrl('/profile/documents'); // 입점 서류 수정 화면으로 이동

                        // 이메일 주소가 있으면 이메일 발송 추가
                        if (breeder.emailAddress) {
                            console.log('✅ [입점 심사 독촉] 이메일 발송 추가됨:', breeder.emailAddress);
                            builder.withEmail({
                                to: breeder.emailAddress,
                                subject: emailContent.subject,
                                html: emailContent.html,
                            });
                        } else {
                            console.log('⚠️ [입점 심사 독촉] 이메일 주소 없음');
                        }

                        await builder.send();

                        await this.logAdminActivity(
                            adminId,
                            'SEND_REMINDER' as AdminAction,
                            AdminTargetType.BREEDER,
                            breederId,
                            breeder.nickname,
                            'Sent document submission reminder',
                        );

                        successIds.push(breederId);
                    } else {
                        failIds.push(breederId);
                    }
                } else if (remindData.remindType === 'profile_completion_reminder') {
                    // [6] 프로필 완성 독려 알림
                    // 입점 승인(APPROVED)되었지만 프로필이 미완성인 브리더 대상
                    console.log('📝 [프로필 완성 독려] 브리더 상태 확인:', {
                        breederId,
                        breederName: breeder.nickname,
                        verificationStatus: breeder.verification?.status,
                        isApproved: breeder.verification?.status === VerificationStatus.APPROVED,
                    });

                    if (breeder.verification?.status === VerificationStatus.APPROVED) {
                        // 이메일 템플릿 생성
                        const emailContent = this.mailTemplateService.getProfileCompletionReminderEmail(
                            breeder.nickname || '브리더',
                        );

                        console.log('📧 [프로필 완성 독려] 이메일 발송 준비:', {
                            breederId,
                            breederName: breeder.nickname,
                            emailAddress: breeder.emailAddress,
                            hasEmailContent: !!emailContent,
                            subject: emailContent?.subject,
                        });

                        // 서비스 알림 빌더 (브리더 프로필 화면으로 이동하도록 설정)
                        const builder = this.notificationService
                            .to(breederId, RecipientType.BREEDER)
                            .type(NotificationType.PROFILE_COMPLETION_REMINDER)
                            .title('📝 브리더 프로필이 아직 완성되지 않았어요!')
                            .content('프로필 작성을 마무리하면 입양자에게 노출되고 상담을 받을 수 있어요.')
                            .targetUrl('/profile'); // 브리더 프로필 화면으로 이동

                        // 이메일 주소가 있으면 이메일 발송 추가
                        if (breeder.emailAddress) {
                            console.log('✅ [프로필 완성 독려] 이메일 발송 추가됨:', breeder.emailAddress);
                            builder.withEmail({
                                to: breeder.emailAddress,
                                subject: emailContent.subject,
                                html: emailContent.html,
                            });
                        } else {
                            console.log('⚠️ [프로필 완성 독려] 이메일 주소 없음');
                        }

                        console.log('🔔 [프로필 완성 독려] 서비스 알림 발송 시작');
                        await builder.send();
                        console.log('✅ [프로필 완성 독려] 서비스 알림 발송 완료');

                        await this.logAdminActivity(
                            adminId,
                            'SEND_REMINDER' as AdminAction,
                            AdminTargetType.BREEDER,
                            breederId,
                            breeder.nickname,
                            'Sent profile completion reminder',
                        );

                        successIds.push(breederId);
                    } else {
                        console.log('❌ [프로필 완성 독려] 브리더가 APPROVED 상태가 아님:', {
                            breederId,
                            breederName: breeder.nickname,
                            currentStatus: breeder.verification?.status,
                        });
                        failIds.push(breederId);
                    }
                } else {
                    failIds.push(breederId);
                }
            } catch (error) {
                failIds.push(breederId);
            }
        }

        return {
            totalCount: remindData.breederIds.length,
            successCount: successIds.length,
            failCount: failIds.length,
            successIds,
            failIds,
            sentAt: new Date(),
        };
    }

    /**
     * 테스트 계정 설정/해제
     *
     * 브리더를 테스트 계정으로 설정하거나 해제합니다.
     * 테스트 계정은 탐색 페이지와 홈 화면에 노출되지 않습니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param isTestAccount 테스트 계정 여부
     * @returns 설정 결과
     */
    async setTestAccount(
        adminId: string,
        breederId: string,
        isTestAccount: boolean,
    ): Promise<SetTestAccountResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        breeder.isTestAccount = isTestAccount;
        await breeder.save();

        const actionDescription = isTestAccount
            ? 'Set as test account (hidden from explore)'
            : 'Removed from test account (visible in explore)';

        await this.logAdminActivity(
            adminId,
            'set_test_account' as AdminAction,
            AdminTargetType.BREEDER,
            breederId,
            breeder.name,
            actionDescription,
        );

        return {
            breederId,
            breederName: breeder.name,
            isTestAccount,
            updatedAt: new Date(),
        };
    }
}

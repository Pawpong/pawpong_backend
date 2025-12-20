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

import { ApplicationMonitoringRequestDto } from './dto/request/application-monitoring-request.dto';
import { BreederSuspendRequestDto } from './dto/request/breeder-suspend-request.dto';
import { BreederRemindRequestDto } from './dto/request/breeder-remind-request.dto';
import { BreederSuspendResponseDto } from './dto/response/breeder-suspend-response.dto';
import { BreederRemindResponseDto } from './dto/response/breeder-remind-response.dto';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

/**
 * 브리더 관리 Admin 서비스
 *
 * 브리더 도메인에 대한 관리자 기능을 제공합니다:
 * - 입양 신청 모니터링
 * - 브리더 제재 처리 (향후 breeder-suspend/admin으로 분리 예정)
 * - 리마인드 알림 발송 (향후 breeder-remind/admin으로 분리 예정)
 *
 * 분리된 기능:
 * - 브리더 인증 관리 → BreederVerificationAdminService
 * - 브리더 레벨 변경 → BreederLevelAdminService
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
     * 입양 신청 모니터링
     *
     * 브리더에게 접수된 입양 신청 현황을 모니터링합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param filter 필터 (breederId, 날짜 범위, pagination)
     * @returns 입양 신청 목록
     */
    async getApplications(adminId: string, filter: ApplicationMonitoringRequestDto): Promise<any> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin) {
            throw new ForbiddenException('Access denied');
        }

        const { targetBreederId, startDate, endDate, pageNumber = 1, itemsPerPage = 10 } = filter;
        const skip = (pageNumber - 1) * itemsPerPage;

        const query: any = {};
        if (targetBreederId) {
            query._id = targetBreederId;
        }

        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        let pipeline: any[] = [{ $match: query }, { $unwind: '$receivedApplications' }];

        if (startDate || endDate) {
            pipeline.push({
                $match: { 'receivedApplications.appliedAt': dateFilter },
            });
        }

        pipeline.push(
            { $sort: { 'receivedApplications.appliedAt': -1 } },
            { $skip: skip },
            { $limit: itemsPerPage },
            {
                $project: {
                    breederName: '$name',
                    breederId: '$_id',
                    application: '$receivedApplications',
                },
            },
        );

        const [applications, totalCount] = await Promise.all([
            this.breederModel.aggregate(pipeline),
            this.breederModel.aggregate([
                { $match: query },
                { $unwind: '$receivedApplications' },
                ...(startDate || endDate ? [{ $match: { 'receivedApplications.appliedAt': dateFilter } }] : []),
                { $count: 'total' },
            ]),
        ]);

        const total = totalCount[0]?.total || 0;

        return {
            applications,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / itemsPerPage),
            hasNext: pageNumber < Math.ceil(total / itemsPerPage),
            hasPrev: pageNumber > 1,
        };
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

        // 브리더에게 이메일 발송 (정지된 계정은 로그인 불가하므로 이메일만 발송)
        let notificationSent = false;
        try {
            if (breeder.emailAddress) {
                const emailContent = this.mailTemplateService.getBreederSuspensionEmail(
                    breeder.nickname,
                    suspendData.reason,
                );

                notificationSent = await this.mailService.sendMail({
                    to: breeder.emailAddress,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            }
        } catch (error) {
            console.error('브리더 정지 이메일 발송 실패:', error);
        }

        return {
            breederId,
            reason: suspendData.reason,
            suspendedAt: new Date(),
            notificationSent,
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

        // 브리더에게 정지 해제 이메일 발송
        let notificationSent = false;
        try {
            if (breeder.emailAddress) {
                const emailContent = this.mailTemplateService.getBreederUnsuspensionEmail(breeder.nickname);

                notificationSent = await this.mailService.sendMail({
                    to: breeder.emailAddress,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            }
        } catch (error) {
            console.error('브리더 정지 해제 이메일 발송 실패:', error);
        }

        return {
            breederId,
            reason: undefined,
            suspendedAt: undefined,
            notificationSent,
        };
    }

    /**
     * 리마인드 알림 발송
     *
     * 서류 미제출 브리더들에게 리마인드 알림을 발송합니다.
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

                // 서류 미제출 상태 확인
                if (breeder.verification?.status === VerificationStatus.PENDING) {
                    // 서비스 알림 + 이메일 발송 (빌더 통합)
                    const emailContent = breeder.emailAddress
                        ? this.mailTemplateService.getDocumentReminderEmail(breeder.nickname)
                        : null;

                    const builder = this.notificationService
                        .to(breederId, RecipientType.BREEDER)
                        .type(NotificationType.DOCUMENT_REMINDER)
                        .title('📄 브리더 입점 절차가 아직 완료되지 않았어요!')
                        .content('필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.')
                        .related(breederId, 'verification');

                    if (emailContent && breeder.emailAddress) {
                        builder.withEmail({
                            to: breeder.emailAddress,
                            subject: emailContent.subject,
                            html: emailContent.html,
                        });
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
}

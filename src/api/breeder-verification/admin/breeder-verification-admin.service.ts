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
import { NotificationService } from '../../../api/notification/notification.service';

import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederVerificationRequestDto } from './dto/request/breeder-verification-request.dto';
import { BreederVerificationResponseDto } from './dto/response/breeder-verification-response.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination/pagination-response.dto';
import { PaginationBuilder } from '../../../common/dto/pagination/pagination-builder.dto';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

/**
 * 브리더 인증 관리 Admin 서비스
 *
 * 브리더 인증 승인/거절 기능을 제공합니다.
 */
@Injectable()
export class BreederVerificationAdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        private readonly mailTemplateService: MailTemplateService,
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
     * 승인 대기 중인 브리더 목록 조회
     */
    async getPendingBreederVerifications(
        adminId: string,
        filter: BreederSearchRequestDto,
    ): Promise<PaginationResponseDto<BreederVerificationResponseDto>> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('Access denied');
        }

        const {
            verificationStatus = VerificationStatus.PENDING,
            cityName,
            searchKeyword,
            pageNumber = 1,
            itemsPerPage = 10,
        } = filter;

        const query: any = { 'verification.status': verificationStatus };

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [
                { nickname: new RegExp(searchKeyword, 'i') },
                { emailAddress: new RegExp(searchKeyword, 'i') },
            ];
        }

        const skip = (pageNumber - 1) * itemsPerPage;

        const [breeders, total] = await Promise.all([
            this.breederModel
                .find(query)
                .select('nickname emailAddress verification profile createdAt')
                .sort({ 'verification.submittedAt': -1 })
                .skip(skip)
                .limit(itemsPerPage)
                .lean(),
            this.breederModel.countDocuments(query),
        ]);

        const items = breeders.map(
            (breeder): BreederVerificationResponseDto => ({
                breederId: (breeder._id as any).toString(),
                breederName: breeder.nickname,
                emailAddress: breeder.emailAddress,
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || 'pending',
                    subscriptionPlan: breeder.verification?.plan || 'basic',
                    submittedAt: breeder.verification?.submittedAt,
                    isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                },
                profileInfo: breeder.profile,
                createdAt: (breeder as any).createdAt,
            }),
        );

        return new PaginationBuilder<BreederVerificationResponseDto>()
            .setItems(items)
            .setPage(pageNumber)
            .setTake(itemsPerPage)
            .setTotalCount(total)
            .build();
    }

    /**
     * 브리더 목록 조회 (통합 검색)
     */
    async getBreeders(
        adminId: string,
        filter: BreederSearchRequestDto,
    ): Promise<PaginationResponseDto<BreederVerificationResponseDto>> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('Access denied');
        }

        const { verificationStatus, cityName, searchKeyword, pageNumber = 1, itemsPerPage = 10 } = filter;

        const query: any = {};

        if (verificationStatus) {
            query['verification.status'] = verificationStatus;
        }

        if (cityName) {
            query['profile.location.city'] = cityName;
        }

        if (searchKeyword) {
            query.$or = [
                { nickname: new RegExp(searchKeyword, 'i') },
                { emailAddress: new RegExp(searchKeyword, 'i') },
            ];
        }

        const skip = (pageNumber - 1) * itemsPerPage;

        const [breeders, total] = await Promise.all([
            this.breederModel
                .find(query)
                .select('nickname emailAddress verification profile createdAt accountStatus')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(itemsPerPage)
                .lean(),
            this.breederModel.countDocuments(query),
        ]);

        const items = breeders.map(
            (breeder): BreederVerificationResponseDto => ({
                breederId: (breeder._id as any).toString(),
                breederName: breeder.nickname,
                emailAddress: breeder.emailAddress,
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || 'pending',
                    subscriptionPlan: breeder.verification?.plan || 'basic',
                    submittedAt: breeder.verification?.submittedAt,
                    isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                },
                profileInfo: breeder.profile,
                createdAt: (breeder as any).createdAt,
            }),
        );

        return new PaginationBuilder<BreederVerificationResponseDto>()
            .setItems(items)
            .setPage(pageNumber)
            .setTake(itemsPerPage)
            .setTotalCount(total)
            .build();
    }

    /**
     * 브리더 인증 승인/거절
     */
    async updateBreederVerification(
        adminId: string,
        breederId: string,
        verificationData: BreederVerificationRequestDto,
    ): Promise<any> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('Access denied');
        }

        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        if (!breeder.verification) {
            throw new BadRequestException('No verification request found');
        }

        breeder.verification.status = verificationData.verificationStatus;
        breeder.verification.reviewedAt = new Date();

        if (verificationData.rejectionReason) {
            breeder.verification.rejectionReason = verificationData.rejectionReason;
        }

        await breeder.save();

        // Log admin activity
        const action =
            verificationData.verificationStatus === VerificationStatus.APPROVED
                ? AdminAction.APPROVE_BREEDER
                : AdminAction.REJECT_BREEDER;

        await this.logAdminActivity(
            adminId,
            action,
            AdminTargetType.BREEDER,
            breederId,
            breeder.nickname,
            `Breeder verification ${verificationData.verificationStatus}`,
        );

        // 알림 및 이메일 발송
        await this.sendVerificationNotification(breeder, verificationData);

        return { message: `Breeder verification ${verificationData.verificationStatus}` };
    }

    /**
     * 브리더 인증 결과 알림 및 이메일 발송
     * @private
     */
    private async sendVerificationNotification(
        breeder: BreederDocument,
        verificationData: BreederVerificationRequestDto,
    ): Promise<void> {
        const breederId = (breeder._id as any).toString();
        const breederName = breeder.nickname;
        const breederEmail = breeder.emailAddress;

        if (verificationData.verificationStatus === VerificationStatus.APPROVED) {
            // 승인 알림 + 이메일 발송
            const emailContent = breederEmail ? this.mailTemplateService.getBreederApprovalEmail(breederName) : null;

            const builder = this.notificationService
                .to(breederId, RecipientType.BREEDER)
                .type(NotificationType.BREEDER_APPROVED)
                .title('🎉 포퐁 브리더 입점이 승인되었습니다!')
                .content('지금 프로필을 세팅하고 아이들 정보를 등록해보세요.')
                .related(breederId, 'home');

            if (emailContent && breederEmail) {
                builder.withEmail({
                    to: breederEmail,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            }

            await builder.send();
        } else if (verificationData.verificationStatus === VerificationStatus.REJECTED) {
            // 반려 알림 + 이메일 발송
            const rejectionReasons = verificationData.rejectionReason
                ? verificationData.rejectionReason.split('\n').filter((r) => r.trim())
                : [];
            const emailContent = breederEmail
                ? this.mailTemplateService.getBreederRejectionEmail(breederName, rejectionReasons)
                : null;

            const builder = this.notificationService
                .to(breederId, RecipientType.BREEDER)
                .type(NotificationType.BREEDER_REJECTED)
                .title('🐾 브리더 입점 심사 결과, 보완이 필요합니다.')
                .content('자세한 사유는 이메일을 확인해주세요.')
                .related(breederId, 'home');

            if (emailContent && breederEmail) {
                builder.withEmail({
                    to: breederEmail,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            }

            await builder.send();
        }
    }
}

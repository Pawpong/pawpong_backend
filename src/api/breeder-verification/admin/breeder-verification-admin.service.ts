import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
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
import { StorageService } from '../../../common/storage/storage.service';
import { AlimtalkService } from '../../../common/alimtalk/alimtalk.service';

import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederVerificationRequestDto } from './dto/request/breeder-verification-request.dto';
import { BreederVerificationResponseDto } from './dto/response/breeder-verification-response.dto';
import { BreederDetailResponseDto } from './dto/response/breeder-detail-response.dto';
import { BreederStatsResponseDto } from './dto/response/breeder-stats-response.dto';
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
    private readonly logger = new Logger(BreederVerificationAdminService.name);

    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        private readonly mailTemplateService: MailTemplateService,
        private readonly notificationService: NotificationService,
        private readonly storageService: StorageService,
        private readonly alimtalkService: AlimtalkService,
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

        const { verificationStatus, cityName, searchKeyword, pageNumber = 1, itemsPerPage = 10 } = filter;

        const query: any = {};

        // 승인 대기: pending과 reviewing 모두 포함 (아직 승인되지 않은 상태)
        if (verificationStatus) {
            query['verification.status'] = verificationStatus;
        } else {
            query['verification.status'] = { $in: [VerificationStatus.PENDING, VerificationStatus.REVIEWING] };
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
                .select('nickname emailAddress verification profile createdAt')
                .sort({ 'verification.submittedAt': -1 })
                .skip(skip)
                .limit(itemsPerPage)
                .lean(),
            this.breederModel.countDocuments(query),
        ]);

        const items = breeders.map((breeder): BreederVerificationResponseDto => {
            // submittedAt이 없으면 가장 오래된 문서의 uploadedAt을 사용
            let submittedAt = breeder.verification?.submittedAt;
            if (!submittedAt && breeder.verification?.documents && breeder.verification.documents.length > 0) {
                const uploadDates = breeder.verification.documents
                    .map((doc: any) => doc.uploadedAt)
                    .filter((date: any): date is Date => date !== undefined)
                    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

                if (uploadDates.length > 0) {
                    submittedAt = uploadDates[0]; // 가장 오래된 문서 업로드 날짜
                }
            }

            return {
                breederId: (breeder._id as any).toString(),
                breederName: breeder.nickname,
                emailAddress: breeder.emailAddress,
                accountStatus: (breeder as any).accountStatus || 'active',
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || 'pending',
                    subscriptionPlan: breeder.verification?.plan || 'basic',
                    level: breeder.verification?.level || 'new',
                    submittedAt: submittedAt,
                    isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                },
                profileInfo: breeder.profile,
                createdAt: (breeder as any).createdAt,
            };
        });

        return new PaginationBuilder<BreederVerificationResponseDto>()
            .setItems(items)
            .setPage(pageNumber)
            .setLimit(itemsPerPage)
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
                .select('nickname emailAddress verification profile createdAt accountStatus isTestAccount')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(itemsPerPage)
                .lean(),
            this.breederModel.countDocuments(query),
        ]);

        const items = breeders.map((breeder): BreederVerificationResponseDto => {
            // submittedAt이 없으면 가장 오래된 문서의 uploadedAt을 사용
            let submittedAt = breeder.verification?.submittedAt;
            if (!submittedAt && breeder.verification?.documents && breeder.verification.documents.length > 0) {
                const uploadDates = breeder.verification.documents
                    .map((doc: any) => doc.uploadedAt)
                    .filter((date: any): date is Date => date !== undefined)
                    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

                if (uploadDates.length > 0) {
                    submittedAt = uploadDates[0]; // 가장 오래된 문서 업로드 날짜
                }
            }

            return {
                breederId: (breeder._id as any).toString(),
                breederName: breeder.nickname,
                emailAddress: breeder.emailAddress,
                accountStatus: (breeder as any).accountStatus || 'active',
                isTestAccount: (breeder as any).isTestAccount || false,
                verificationInfo: {
                    verificationStatus: breeder.verification?.status || 'pending',
                    subscriptionPlan: breeder.verification?.plan || 'basic',
                    level: breeder.verification?.level || 'new',
                    submittedAt: submittedAt,
                    isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                },
                profileInfo: breeder.profile,
                createdAt: (breeder as any).createdAt,
            };
        });

        return new PaginationBuilder<BreederVerificationResponseDto>()
            .setItems(items)
            .setPage(pageNumber)
            .setLimit(itemsPerPage)
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

        await breeder.save({ validateBeforeSave: false });

        // Log admin activity
        let action: AdminAction;
        if (verificationData.verificationStatus === VerificationStatus.APPROVED) {
            action = AdminAction.APPROVE_BREEDER;
        } else if (verificationData.verificationStatus === VerificationStatus.REJECTED) {
            action = AdminAction.REJECT_BREEDER;
        } else {
            action = AdminAction.REVIEW_BREEDER; // REVIEWING 상태일 때
        }

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
     * 브리더 상세 정보 조회
     *
     * 특정 브리더의 상세 정보를 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @returns 브리더 상세 정보
     */
    async getBreederDetail(adminId: string, breederId: string): Promise<BreederDetailResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        const breeder = await this.breederModel.findById(breederId).lean();
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        // submittedAt이 없으면 가장 오래된 문서의 uploadedAt을 사용
        let submittedAt = breeder.verification?.submittedAt;
        if (!submittedAt && breeder.verification?.documents && breeder.verification.documents.length > 0) {
            const uploadDates = breeder.verification.documents
                .map((doc) => doc.uploadedAt)
                .filter((date): date is Date => date !== undefined)
                .sort((a, b) => a.getTime() - b.getTime());

            if (uploadDates.length > 0) {
                submittedAt = uploadDates[0]; // 가장 오래된 문서 업로드 날짜
            }
        }

        return {
            breederId: (breeder._id as any).toString(),
            email: breeder.emailAddress,
            nickname: breeder.nickname,
            phone: breeder.phoneNumber,
            businessNumber: undefined,
            businessName: (breeder as any).name || breeder.nickname,
            verificationInfo: {
                verificationStatus: breeder.verification?.status || 'pending',
                subscriptionPlan: breeder.verification?.plan || 'basic',
                level: breeder.verification?.level || 'new',
                submittedAt: submittedAt,
                processedAt: breeder.verification?.reviewedAt,
                isSubmittedByEmail: breeder.verification?.submittedByEmail || false,
                documents:
                    breeder.verification?.documents?.map((doc) => ({
                        type: doc.type,
                        fileName: doc.fileName,
                        fileUrl: this.storageService.generateSignedUrl(doc.fileName, 60),
                        uploadedAt: doc.uploadedAt,
                    })) || [],
                rejectionReason: breeder.verification?.rejectionReason,
            },
            profileInfo: {
                location: breeder.profile?.location?.city,
                detailedLocation: breeder.profile?.location?.district,
                specialization: breeder.profile?.specialization,
                breeds: (breeder as any).breeds || [],
                description: breeder.profile?.description,
                experienceYears: breeder.profile?.experienceYears,
            },
            createdAt: breeder.createdAt!,
            updatedAt: breeder.updatedAt!,
        };
    }

    /**
     * 승인된 브리더 통계 조회
     *
     * 전체 승인된 브리더의 레벨별 통계를 조회합니다.
     *
     * @param adminId 관리자 고유 ID
     * @returns 브리더 통계 정보
     */
    async getBreederStats(adminId: string): Promise<BreederStatsResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        // 승인된 브리더만 집계
        const query = { 'verification.status': VerificationStatus.APPROVED };

        const [totalApproved, eliteCount] = await Promise.all([
            this.breederModel.countDocuments(query),
            this.breederModel.countDocuments({
                ...query,
                'verification.plan': 'premium',
            }),
        ]);

        return {
            totalApproved,
            eliteCount,
            newCount: totalApproved - eliteCount,
        };
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
        const breederPhone = breeder.phoneNumber;

        if (verificationData.verificationStatus === VerificationStatus.APPROVED) {
            // 승인 알림 + 이메일 발송
            const emailContent = breederEmail ? this.mailTemplateService.getBreederApprovalEmail(breederName) : null;

            const builder = this.notificationService
                .to(breederId, RecipientType.BREEDER)
                .type(NotificationType.BREEDER_APPROVED)
                .title('🎉 포퐁 브리더 입점이 승인되었습니다!')
                .content('지금 프로필을 세팅하고 아이들 정보를 등록해보세요.')
                .related('/profile', 'page');

            if (emailContent && breederEmail) {
                builder.withEmail({
                    to: breederEmail,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            }

            await builder.send();

            // 카카오 알림톡 발송
            if (breederPhone) {
                try {
                    const alimtalkResult = await this.alimtalkService.sendBreederApproved(breederPhone);
                    if (alimtalkResult.success) {
                        this.logger.log(`[sendVerificationNotification] 브리더 승인 알림톡 발송 성공: ${breederPhone}`);
                    } else {
                        this.logger.warn(
                            `[sendVerificationNotification] 브리더 승인 알림톡 발송 실패: ${alimtalkResult.error}`,
                        );
                    }
                } catch (error) {
                    this.logger.error(`[sendVerificationNotification] 알림톡 발송 오류: ${error.message}`);
                }
            }
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
                .related('/profile', 'page');

            if (emailContent && breederEmail) {
                builder.withEmail({
                    to: breederEmail,
                    subject: emailContent.subject,
                    html: emailContent.html,
                });
            }

            await builder.send();

            // 카카오 알림톡 발송
            if (breederPhone) {
                try {
                    const alimtalkResult = await this.alimtalkService.sendBreederRejected(breederPhone);
                    if (alimtalkResult.success) {
                        this.logger.log(`[sendVerificationNotification] 브리더 반려 알림톡 발송 성공: ${breederPhone}`);
                    } else {
                        this.logger.warn(
                            `[sendVerificationNotification] 브리더 반려 알림톡 발송 실패: ${alimtalkResult.error}`,
                        );
                    }
                } catch (error) {
                    this.logger.error(`[sendVerificationNotification] 알림톡 발송 오류: ${error.message}`);
                }
            }
        }
    }

    /**
     * 서류 미제출 브리더에게 독촉 메일 발송
     *
     * 승인 후 4주 경과했지만 서류를 제출하지 않은 브리더들을 찾아서
     * 독촉 이메일을 발송합니다.
     *
     * @param adminId 관리자 고유 ID
     * @returns 발송 성공한 브리더 수
     */
    async sendDocumentReminders(adminId: string): Promise<{ sentCount: number; breederIds: string[] }> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('브리더 관리 권한이 없습니다.');
        }

        // 4주 = 28일 전
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        // 승인되었지만 서류를 제출하지 않은 브리더 찾기
        // 1. 승인된 브리더
        // 2. 승인일이 4주 이전
        // 3. 서류가 없거나 비어있음
        const incompleteBreeders = await this.breederModel
            .find({
                'verification.status': VerificationStatus.APPROVED,
                'verification.reviewedAt': { $lte: fourWeeksAgo },
                $or: [{ 'verification.documents': { $exists: false } }, { 'verification.documents': { $size: 0 } }],
            })
            .select('_id nickname emailAddress phoneNumber verification')
            .lean();

        const breederIds: string[] = [];
        let sentCount = 0;

        // 각 브리더에게 독촉 메일 + 알림톡 발송
        for (const breeder of incompleteBreeders) {
            const breederId = (breeder._id as any).toString();
            const breederName = breeder.nickname;
            const breederEmail = breeder.emailAddress;
            const breederPhone = breeder.phoneNumber;

            try {
                // 이메일 발송
                if (breederEmail) {
                    const emailContent = this.mailTemplateService.getDocumentReminderEmail(breederName);

                    const builder = this.notificationService
                        .to(breederId, RecipientType.BREEDER)
                        .type(NotificationType.DOCUMENT_REMINDER)
                        .title('🐾 브리더 입점 절차가 아직 완료되지 않았어요!')
                        .content('필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.')
                        .related(breederId, 'profile');

                    builder.withEmail({
                        to: breederEmail,
                        subject: emailContent.subject,
                        html: emailContent.html,
                    });

                    await builder.send();
                }

                // 카카오 알림톡 발송
                if (breederPhone) {
                    const alimtalkResult = await this.alimtalkService.sendDocumentReminder(breederPhone, breederName);
                    if (alimtalkResult.success) {
                        this.logger.log(`[sendDocumentReminders] 서류 독촉 알림톡 발송 성공: ${breederPhone}`);
                    } else {
                        this.logger.warn(`[sendDocumentReminders] 서류 독촉 알림톡 발송 실패: ${alimtalkResult.error}`);
                    }
                }

                breederIds.push(breederId);
                sentCount++;

                // 관리자 활동 로그 기록
                await this.logAdminActivity(
                    adminId,
                    AdminAction.REVIEW_BREEDER,
                    AdminTargetType.BREEDER,
                    breederId,
                    breederName,
                    'Document reminder sent (email + alimtalk)',
                );
            } catch (error) {
                this.logger.error(`Failed to send reminder to breeder ${breederId}: ${error.message}`);
            }
        }

        return {
            sentCount,
            breederIds,
        };
    }
}

import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BreederLevel, NotificationType, RecipientType } from '../../../common/enum/user.enum';
import { NotificationService } from '../../notification/notification.service';

import { BreederLevelChangeRequestDto } from './dto/request/breeder-level-change-request.dto';
import { BreederLevelChangeResponseDto } from './dto/response/breeder-level-change-response.dto';

import { Admin, AdminDocument } from '../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../schema/breeder.schema';

/**
 * 브리더 레벨 관리 Admin 서비스
 *
 * 관리자가 브리더 레벨을 관리하는 기능을 제공합니다.
 */
@Injectable()
export class BreederLevelAdminService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        private notificationService: NotificationService,
    ) {}

    /**
     * 브리더 레벨 변경
     *
     * @param adminId 관리자 고유 ID
     * @param breederId 브리더 고유 ID
     * @param levelData 레벨 변경 데이터
     * @returns 변경 결과
     */
    async changeBreederLevel(
        adminId: string,
        breederId: string,
        levelData: BreederLevelChangeRequestDto,
    ): Promise<BreederLevelChangeResponseDto> {
        const admin = await this.adminModel.findById(adminId);
        if (!admin || !admin.permissions.canManageBreeders) {
            throw new ForbiddenException('Access denied');
        }

        const breeder = await this.breederModel.findById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        const previousLevel = breeder.verification?.level || BreederLevel.NEW;
        breeder.verification.level = levelData.newLevel;
        await breeder.save();

        // 알림 발송
        await this.notificationService.createNotification({
            recipientType: RecipientType.BREEDER,
            recipientId: breederId,
            type: NotificationType.PROFILE_REVIEW,
            title: '브리더 레벨 변경',
            content: `브리더 레벨이 ${previousLevel === BreederLevel.NEW ? '뉴' : '엘리트'}에서 ${levelData.newLevel === BreederLevel.NEW ? '뉴' : '엘리트'}로 변경되었습니다.`,
        });

        return {
            breederId,
            breederName: breeder.nickname,
            previousLevel,
            newLevel: levelData.newLevel,
            changedAt: new Date(),
            changedBy: admin.name,
        };
    }
}

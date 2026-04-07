import { Body, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { ChangeBreederLevelUseCase } from './application/use-cases/change-breeder-level.use-case';
import { SendDocumentRemindersUseCase } from './application/use-cases/send-document-reminders.use-case';
import { UpdateBreederVerificationUseCase } from './application/use-cases/update-breeder-verification.use-case';
import { BreederVerificationAdminProtectedController } from './decorator/breeder-verification-admin-controller.decorator';
import { BreederLevelChangeRequestDto } from './dto/request/breeder-level-change-request.dto';
import { BreederVerificationRequestDto } from './dto/request/breeder-verification-request.dto';
import { BreederLevelChangeResponseDto } from './dto/response/breeder-level-change-response.dto';
import {
    ApiChangeBreederLevelAdminEndpoint,
    ApiSendDocumentRemindersAdminEndpoint,
    ApiUpdateBreederVerificationAdminEndpoint,
} from './swagger';

@BreederVerificationAdminProtectedController()
export class BreederVerificationAdminCommandController {
    constructor(
        private readonly updateBreederVerificationUseCase: UpdateBreederVerificationUseCase,
        private readonly sendDocumentRemindersUseCase: SendDocumentRemindersUseCase,
        private readonly changeBreederLevelUseCase: ChangeBreederLevelUseCase,
    ) {}

    @Patch('verification/:breederId')
    @ApiUpdateBreederVerificationAdminEndpoint()
    async updateBreederVerification(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() verificationData: BreederVerificationRequestDto,
    ): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.updateBreederVerificationUseCase.execute(adminId, breederId, verificationData);
        return ApiResponseDto.success(result, '브리더 인증 처리가 완료되었습니다.');
    }

    @Post('document-reminders/send')
    @ApiSendDocumentRemindersAdminEndpoint()
    async sendDocumentReminders(
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<{ sentCount: number; breederIds: string[] }>> {
        const result = await this.sendDocumentRemindersUseCase.execute(adminId);
        return ApiResponseDto.success(result, `${result.sentCount}명의 브리더에게 서류 독촉 이메일이 발송되었습니다.`);
    }

    @Patch('level/:breederId')
    @ApiChangeBreederLevelAdminEndpoint()
    async changeBreederLevel(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() levelData: BreederLevelChangeRequestDto,
    ): Promise<ApiResponseDto<BreederLevelChangeResponseDto>> {
        const result = await this.changeBreederLevelUseCase.execute(adminId, breederId, levelData);
        return ApiResponseDto.success(result, '브리더 레벨이 변경되었습니다.');
    }
}

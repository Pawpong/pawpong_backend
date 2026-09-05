import { Body, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../../../common/dto/response/api-response.dto';
import { SendDocumentRemindersUseCase } from '../application/use-cases/send-document-reminders.use-case';
import { UpdateBreederVerificationUseCase } from '../application/use-cases/update-breeder-verification.use-case';
import { BreederVerificationAdminProtectedController } from '../decorator/breeder-verification-admin-controller.decorator';
import { BreederVerificationRequestDto } from '../dto/request/breeder-verification-request.dto';
import {
    BREEDER_RESPONSE_MESSAGES,
    buildBreederDocumentReminderMessage,
} from '../../../../service/breeder/constants/breeder-response-messages';
import { ApiSendDocumentRemindersAdminEndpoint, ApiUpdateBreederVerificationAdminEndpoint } from '../swagger/index';

@BreederVerificationAdminProtectedController()
export class BreederVerificationAdminCommandController {
    constructor(
        private readonly updateBreederVerificationUseCase: UpdateBreederVerificationUseCase,
        private readonly sendDocumentRemindersUseCase: SendDocumentRemindersUseCase,
    ) {}

    @Patch('verification/:breederId')
    @ApiUpdateBreederVerificationAdminEndpoint()
    async updateBreederVerification(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() verificationData: BreederVerificationRequestDto,
    ): Promise<ApiResponseDto<{ message: string }>> {
        const result = await this.updateBreederVerificationUseCase.execute(adminId, breederId, verificationData);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.verificationUpdated);
    }

    @Post('document-reminders/send')
    @HttpCode(HttpStatus.OK)
    @ApiSendDocumentRemindersAdminEndpoint()
    async sendDocumentReminders(
        @CurrentUser('userId') adminId: string,
    ): Promise<ApiResponseDto<{ sentCount: number; breederIds: string[] }>> {
        const result = await this.sendDocumentRemindersUseCase.execute(adminId);
        return ApiResponseDto.success(result, buildBreederDocumentReminderMessage(result.sentCount));
    }
}

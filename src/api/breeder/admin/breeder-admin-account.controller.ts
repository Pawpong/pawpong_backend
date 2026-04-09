import { Body, Param, Patch, Post } from '@nestjs/common';

import { CurrentUser } from '../../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../../common/dto/response/api-response.dto';
import { SetBreederTestAccountUseCase } from './application/use-cases/set-breeder-test-account.use-case';
import { SuspendBreederUseCase } from './application/use-cases/suspend-breeder.use-case';
import { UnsuspendBreederUseCase } from './application/use-cases/unsuspend-breeder.use-case';
import { BreederAdminProtectedController } from './decorator/breeder-admin-controller.decorator';
import { BreederSuspendRequestDto } from './dto/request/breeder-suspend-request.dto';
import { SetTestAccountRequestDto } from './dto/request/set-test-account-request.dto';
import { BreederSuspendResponseDto } from './dto/response/breeder-suspend-response.dto';
import { SetTestAccountResponseDto } from './dto/response/set-test-account-response.dto';
import { BREEDER_RESPONSE_MESSAGES, buildBreederTestAccountMessage } from '../domain/services/breeder-response-message.service';
import {
    ApiSetBreederTestAccountAdminEndpoint,
    ApiSuspendBreederAdminEndpoint,
    ApiUnsuspendBreederAdminEndpoint,
} from './swagger';

@BreederAdminProtectedController()
export class BreederAdminAccountController {
    constructor(
        private readonly suspendBreederUseCase: SuspendBreederUseCase,
        private readonly unsuspendBreederUseCase: UnsuspendBreederUseCase,
        private readonly setBreederTestAccountUseCase: SetBreederTestAccountUseCase,
    ) {}

    @Post('suspend/:breederId')
    @ApiSuspendBreederAdminEndpoint()
    async suspendBreeder(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() suspendData: BreederSuspendRequestDto,
    ): Promise<ApiResponseDto<BreederSuspendResponseDto>> {
        const result = await this.suspendBreederUseCase.execute(adminId, breederId, suspendData);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.accountSuspended);
    }

    @Post('unsuspend/:breederId')
    @ApiUnsuspendBreederAdminEndpoint()
    async unsuspendBreeder(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
    ): Promise<ApiResponseDto<BreederSuspendResponseDto>> {
        const result = await this.unsuspendBreederUseCase.execute(adminId, breederId);
        return ApiResponseDto.success(result, BREEDER_RESPONSE_MESSAGES.accountUnsuspended);
    }

    @Patch('test-account/:breederId')
    @ApiSetBreederTestAccountAdminEndpoint()
    async setTestAccount(
        @CurrentUser('userId') adminId: string,
        @Param('breederId') breederId: string,
        @Body() dto: SetTestAccountRequestDto,
    ): Promise<ApiResponseDto<SetTestAccountResponseDto>> {
        const result = await this.setBreederTestAccountUseCase.execute(adminId, breederId, dto.isTestAccount);
        const message = buildBreederTestAccountMessage(dto.isTestAccount);
        return ApiResponseDto.success(result, message);
    }
}

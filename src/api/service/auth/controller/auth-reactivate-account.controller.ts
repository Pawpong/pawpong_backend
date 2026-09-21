import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { ReactivateAccountUseCase } from '../application/use-cases/reactivate-account.use-case';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../constants/auth-response-messages';
import { AuthPublicController } from '../decorator/auth-public-controller.decorator';
import { ReactivateAccountRequestDto } from '../dto/request/reactivate-account-request.dto';
import { ReactivateAccountResponseDto } from '../dto/response/reactivate-account-response.dto';
import { ApiReactivateAccountEndpoint } from '../swagger/index';

@AuthPublicController()
export class AuthReactivateAccountController {
    constructor(private readonly reactivateAccountUseCase: ReactivateAccountUseCase) {}

    @Post('reactivate')
    @HttpCode(HttpStatus.OK)
    @ApiReactivateAccountEndpoint()
    async reactivate(
        @Body() reactivateAccountDto: ReactivateAccountRequestDto,
    ): Promise<ApiResponseDto<ReactivateAccountResponseDto>> {
        const result = await this.reactivateAccountUseCase.execute(reactivateAccountDto.reactivationToken);
        return ApiResponseDto.success(result, AUTH_RESPONSE_MESSAGE_EXAMPLES.accountReactivated);
    }
}

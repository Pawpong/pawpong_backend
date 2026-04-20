import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { CheckBreederNameDuplicateUseCase } from './application/use-cases/check-breeder-name-duplicate.use-case';
import { CheckEmailDuplicateUseCase } from './application/use-cases/check-email-duplicate.use-case';
import { CheckNicknameDuplicateUseCase } from './application/use-cases/check-nickname-duplicate.use-case';
import { buildAuthDuplicateCheckMessage } from './constants/auth-response-messages';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { CheckBreederNameRequestDto } from './dto/request/check-breeder-name-request.dto';
import { CheckEmailRequestDto } from './dto/request/check-email-request.dto';
import { CheckNicknameRequestDto } from './dto/request/check-nickname-request.dto';
import {
    ApiCheckBreederNameDuplicateEndpoint,
    ApiCheckEmailDuplicateEndpoint,
    ApiCheckNicknameDuplicateEndpoint,
} from './swagger';

@AuthPublicController()
export class AuthDuplicateCheckController {
    constructor(
        private readonly checkEmailDuplicateUseCase: CheckEmailDuplicateUseCase,
        private readonly checkNicknameDuplicateUseCase: CheckNicknameDuplicateUseCase,
        private readonly checkBreederNameDuplicateUseCase: CheckBreederNameDuplicateUseCase,
    ) {}

    @Post('check-email')
    @HttpCode(HttpStatus.OK)
    @ApiCheckEmailDuplicateEndpoint()
    async checkEmailDuplicate(@Body() dto: CheckEmailRequestDto): Promise<ApiResponseDto<{ isDuplicate: boolean }>> {
        const isDuplicate = await this.checkEmailDuplicateUseCase.execute(dto.email);
        return ApiResponseDto.success({ isDuplicate }, buildAuthDuplicateCheckMessage('email', isDuplicate));
    }

    @Post('check-nickname')
    @HttpCode(HttpStatus.OK)
    @ApiCheckNicknameDuplicateEndpoint()
    async checkNicknameDuplicate(
        @Body() dto: CheckNicknameRequestDto,
    ): Promise<ApiResponseDto<{ isDuplicate: boolean }>> {
        const isDuplicate = await this.checkNicknameDuplicateUseCase.execute(dto.nickname);
        return ApiResponseDto.success({ isDuplicate }, buildAuthDuplicateCheckMessage('nickname', isDuplicate));
    }

    @Post('check-breeder-name')
    @HttpCode(HttpStatus.OK)
    @ApiCheckBreederNameDuplicateEndpoint()
    async checkBreederNameDuplicate(
        @Body() dto: CheckBreederNameRequestDto,
    ): Promise<ApiResponseDto<{ isDuplicate: boolean }>> {
        const isDuplicate = await this.checkBreederNameDuplicateUseCase.execute(dto.breederName);
        return ApiResponseDto.success({ isDuplicate }, buildAuthDuplicateCheckMessage('breederName', isDuplicate));
    }
}

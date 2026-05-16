import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../../../common/dto/response/api-response.dto';
import { RegisterAdopterResponseDto } from '../../dto/response/register-adopter-response.dto';
import { ApiPublicController } from '../../../../common/decorator/swagger.decorator';
import { RegisterAdopterV2UseCase } from '../application/use-cases/register-adopter-v2.use-case';
import { RegisterAdopterV2RequestDto } from '../dto/request/register-adopter-v2-request.dto';
import { ApiRegisterAdopterV2Endpoint } from '../swagger';

/**
 * v2 입양자 회원가입 컨트롤러
 * 라우트: POST /api/v2/auth/register-adopter
 */
@ApiPublicController('인증 v2')
@Controller('v2/auth')
export class AuthV2RegisterAdopterController {
    constructor(private readonly registerAdopterV2UseCase: RegisterAdopterV2UseCase) {}

    @Post('register-adopter')
    @HttpCode(HttpStatus.OK)
    @ApiRegisterAdopterV2Endpoint()
    async registerAdopter(
        @Body() dto: RegisterAdopterV2RequestDto,
    ): Promise<ApiResponseDto<RegisterAdopterResponseDto>> {
        const result = await this.registerAdopterV2UseCase.execute(dto);
        return ApiResponseDto.success(result, '입양자 회원가입이 완료되었습니다.');
    }
}

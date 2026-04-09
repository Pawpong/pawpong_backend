import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { RegisterAdopterUseCase } from './application/use-cases/register-adopter.use-case';
import { RegisterBreederUseCase } from './application/use-cases/register-breeder.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthRegistrationResponseMessageService } from './domain/services/auth-registration-response-message.service';
import { RegisterAdopterRequestDto } from './dto/request/register-adopter-request.dto';
import { RegisterBreederRequestDto } from './dto/request/register-breeder-request.dto';
import { RegisterAdopterResponseDto } from './dto/response/register-adopter-response.dto';
import { RegisterBreederResponseDto } from './dto/response/register-breeder-response.dto';
import { ApiRegisterAdopterEndpoint, ApiRegisterBreederEndpoint } from './swagger';

@AuthPublicController()
export class AuthSignupController {
    constructor(
        private readonly registerAdopterUseCase: RegisterAdopterUseCase,
        private readonly registerBreederUseCase: RegisterBreederUseCase,
        private readonly authRegistrationResponseMessageService: AuthRegistrationResponseMessageService,
    ) {}

    @Post('register/adopter')
    @HttpCode(HttpStatus.OK)
    @ApiRegisterAdopterEndpoint()
    async registerAdopter(@Body() dto: RegisterAdopterRequestDto): Promise<ApiResponseDto<RegisterAdopterResponseDto>> {
        const result = await this.registerAdopterUseCase.execute(dto);
        return ApiResponseDto.success(result, this.authRegistrationResponseMessageService.getSignupCompleted('adopter'));
    }

    @Post('register/breeder')
    @HttpCode(HttpStatus.OK)
    @ApiRegisterBreederEndpoint()
    async registerBreeder(@Body() dto: RegisterBreederRequestDto): Promise<ApiResponseDto<RegisterBreederResponseDto>> {
        const result = await this.registerBreederUseCase.execute(dto);
        return ApiResponseDto.success(result, this.authRegistrationResponseMessageService.getSignupCompleted('breeder'));
    }
}

import { HttpCode, HttpStatus, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { OptionalJwtAuthGuard } from '../../common/guard/optional-jwt-auth.guard';
import { UploadResponseDto } from '../upload/dto/response/upload-response.dto';
import { UploadAuthProfileImageUseCase } from './application/use-cases/upload-auth-profile-image.use-case';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthUploadPresentationService } from './domain/services/auth-upload-presentation.service';
import { ApiUploadProfileEndpoint } from './swagger';

@AuthPublicController()
export class AuthProfileUploadController {
    constructor(
        private readonly uploadAuthProfileImageUseCase: UploadAuthProfileImageUseCase,
        private readonly authUploadPresentationService: AuthUploadPresentationService,
    ) {}

    @Post('upload-breeder-profile')
    @UseGuards(OptionalJwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiUploadProfileEndpoint()
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfile(
        @UploadedFile() file: Express.Multer.File,
        @Query('tempId') tempId?: string,
        @CurrentUser('userId') userId?: string,
        @CurrentUser('role') role?: string,
    ): Promise<ApiResponseDto<UploadResponseDto>> {
        const result = await this.uploadAuthProfileImageUseCase.execute(
            file,
            userId && role ? { userId, role } : undefined,
            tempId,
        );
        const response = new UploadResponseDto(result.cdnUrl, result.fileName, result.size);
        const message = this.authUploadPresentationService.getProfileUploadMessage(Boolean(userId && role), tempId);
        return ApiResponseDto.success(response, message);
    }
}

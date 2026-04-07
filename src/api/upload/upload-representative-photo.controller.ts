import { Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/decorator/user.decorator';
import { ApiResponseDto } from '../../common/dto/response/api-response.dto';
import { UploadRepresentativePhotosUseCase } from './application/use-cases/upload-representative-photos.use-case';
import { ProtectedUploadController } from './decorator/upload-controller.decorator';
import { UploadResponseDto } from './dto/response/upload-response.dto';
import { ApiUploadRepresentativePhotosEndpoint } from './swagger';

@ProtectedUploadController()
export class UploadRepresentativePhotoController {
    constructor(private readonly uploadRepresentativePhotosUseCase: UploadRepresentativePhotosUseCase) {}

    @Post('representative-photos')
    @ApiUploadRepresentativePhotosEndpoint()
    @UseInterceptors(FilesInterceptor('files', 3))
    async uploadRepresentativePhotos(
        @UploadedFiles() files: Express.Multer.File[],
        @CurrentUser('userId') userId: string,
        @CurrentUser('role') role: string,
    ): Promise<ApiResponseDto<UploadResponseDto[]>> {
        const responses = await this.uploadRepresentativePhotosUseCase.execute(files, userId, role);
        return ApiResponseDto.success(responses, '대표 사진이 업로드되고 저장되었습니다.');
    }
}

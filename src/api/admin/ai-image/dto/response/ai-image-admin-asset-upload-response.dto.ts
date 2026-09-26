import { ApiProperty } from '@nestjs/swagger';

export class AiImageAdminAssetUploadResponseDto {
    @ApiProperty({ description: '업로드된 파일키', example: 'ai-image/reference/uuid.png' })
    objectKey: string;

    @ApiProperty({ description: '업로드된 이미지 URL', nullable: true })
    imageUrl: string | null;
}

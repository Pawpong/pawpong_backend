import { ApiProperty } from '@nestjs/swagger';

export class AiImageSourceUploadResponseDto {
    @ApiProperty({ description: '생성 요청에 넘길 원본 파일키', example: 'ai-image/source/uuid.jpg' })
    inputObjectKey: string;

    @ApiProperty({ description: '업로드한 원본 URL', nullable: true })
    imageUrl: string | null;
}

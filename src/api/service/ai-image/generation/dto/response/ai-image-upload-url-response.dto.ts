import { ApiProperty } from '@nestjs/swagger';

export class AiImageUploadUrlResponseDto {
    @ApiProperty({ description: '클라이언트가 PUT 할 presigned URL' })
    uploadUrl: string;

    @ApiProperty({ description: '업로드 후 생성 요청에 넘길 S3 파일키', example: 'ai-image/source/uuid.jpg' })
    inputObjectKey: string;

    @ApiProperty({ description: 'URL 유효 시간(초)', example: 600 })
    expiresInSeconds: number;
}

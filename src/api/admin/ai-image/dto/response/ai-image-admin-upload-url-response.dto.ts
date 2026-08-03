import { ApiProperty } from '@nestjs/swagger';

/** 어드민 애셋 업로드 URL 발급 결과 */
export class AiImageAdminUploadUrlResponseDto {
    @ApiProperty({ description: '버킷에 직접 PUT 할 presigned URL' })
    uploadUrl: string;

    @ApiProperty({
        description: '업로드 후 필터 저장·미리보기에 넘길 S3 파일키',
        example: 'ai-image/filter/3f2b1c8e-0a11-4f2e-9a77-4b1c2d3e4f50.png',
    })
    objectKey: string;

    @ApiProperty({ description: 'URL 유효 시간(초)', example: 1800 })
    expiresInSeconds: number;
}

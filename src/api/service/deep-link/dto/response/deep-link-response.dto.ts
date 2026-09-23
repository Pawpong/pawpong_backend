import { ApiProperty } from '@nestjs/swagger';

/** 웹 공유 페이지와 앱이 사용하는 공개 링크 메타데이터. */
export class DeepLinkResponseDto {
    @ApiProperty() slug: string;
    @ApiProperty() title: string;
    @ApiProperty() description: string;
    @ApiProperty() targetPath: string;
    @ApiProperty() imageUrl: string;
}

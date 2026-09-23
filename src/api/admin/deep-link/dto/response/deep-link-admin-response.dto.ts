import { ApiProperty } from '@nestjs/swagger';
import { DeepLinkResponseDto } from '../../../../service/deep-link/dto/response/deep-link-response.dto';

/** 공개 필드에 관리자 식별자와 관리 상태를 추가한다. */
export class DeepLinkAdminResponseDto extends DeepLinkResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() isActive: boolean;
    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;
}

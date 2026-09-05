import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomRequestDto {
    @ApiProperty({ description: '대화 상대 사용자 ID', required: false })
    @IsOptional()
    @IsString()
    counterpartUserId?: string;

    @ApiProperty({
        description: '브리더 ID (기존 클라이언트 호환용, counterpartUserId 사용 권장)',
        required: false,
        deprecated: true,
    })
    @IsOptional()
    @IsString()
    breederId?: string;

    @ApiProperty({ description: '연결된 입양 상담 신청 ID (선택)', required: false })
    @IsOptional()
    @IsString()
    applicationId?: string;
}

import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomRequestDto {
    @ApiProperty({ description: '브리더 ID' })
    @IsString()
    breederId: string;

    @ApiProperty({ description: '연결된 입양 상담 신청 ID (선택)', required: false })
    @IsOptional()
    @IsString()
    applicationId?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 브리더 제재 요청 DTO
 *
 * POST /api/breeder-admin/suspend/:breederId
 * 브리더 계정을 영구정지 처리합니다.
 */
export class BreederSuspendRequestDto {
    /**
     * 제재 사유
     * @example "반복적인 규정 위반으로 인한 영구정지"
     */
    @ApiProperty({
        description: '제재 사유',
        example: '반복적인 규정 위반으로 인한 영구정지',
    })
    @IsString({ message: '제재 사유는 문자열이어야 합니다.' })
    @IsNotEmpty({ message: '제재 사유는 필수입니다.' })
    reason: string;
}

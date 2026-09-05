import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 프로필 수정 응답 DTO
 * 브리더가 프로필을 성공적으로 수정했을 때 반환되는 데이터 구조입니다.
 */
export class BreederProfileUpdateResponseDto {
    @ApiProperty({
        description: '프로필 수정 완료 메시지',
        example: '프로필이 성공적으로 수정되었습니다.',
    })
    message: string;
}

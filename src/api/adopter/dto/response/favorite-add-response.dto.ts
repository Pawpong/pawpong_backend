import { ApiProperty } from '@nestjs/swagger';

/**
 * 즐겨찾기 추가 응답 DTO
 * 브리더가 즐겨찾기에 성공적으로 추가되었을 때 반환되는 데이터 구조입니다.
 */
export class FavoriteAddResponseDto {
    /**
     * 추가 완료 메시지
     * @example "즐겨찾기에 성공적으로 추가되었습니다."
     */
    @ApiProperty({
        description: '추가 완료 메시지',
        example: '즐겨찾기에 성공적으로 추가되었습니다.',
    })
    message: string;
}

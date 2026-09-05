import { ApiProperty } from '@nestjs/swagger';

/**
 * 즐겨찾기 삭제 응답 DTO
 * 즐겨찾기에서 브리더가 성공적으로 삭제되었을 때 반환되는 데이터 구조입니다.
 */
export class FavoriteRemoveResponseDto {
    /**
     * 삭제 완료 메시지
     * @example "즐겨찾기에서 성공적으로 삭제되었습니다."
     */
    @ApiProperty({
        description: '삭제 완료 메시지',
        example: '즐겨찾기에서 성공적으로 삭제되었습니다.',
    })
    message: string;
}

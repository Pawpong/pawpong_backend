import { ApiProperty } from '@nestjs/swagger';

export class TemplateActionResponseDto {
    @ApiProperty({
        description: '처리 성공 여부',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: '처리 결과 메시지',
        example: '템플릿이 삭제되었습니다: VERIFICATION_CODE',
    })
    message: string;
}

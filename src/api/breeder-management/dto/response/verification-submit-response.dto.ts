import { ApiProperty } from '@nestjs/swagger';

/**
 * 브리더 인증 신청 응답 DTO
 * 인증 신청 또는 서류 제출이 성공적으로 완료되었을 때 반환되는 데이터 구조입니다.
 */
export class VerificationSubmitResponseDto {
    /**
     * 인증 신청 완료 메시지
     * @example "브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다."
     */
    @ApiProperty({
        description: '인증 신청 또는 서류 제출 완료 메시지',
        example: '브리더 인증 신청이 성공적으로 제출되었습니다. 관리자 검토 후 결과를 알려드립니다.',
    })
    message: string;
}

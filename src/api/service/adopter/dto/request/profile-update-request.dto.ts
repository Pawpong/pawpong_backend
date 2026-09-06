import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

/**
 * 입양 상담 사전 정보 (가입 시 작성한 공통 신청서).
 * 매 신청마다 같은 값을 다시 쓰지 않도록 프로필에 저장해 두고 여기서 고친다.
 * 개인정보 수집 동의는 가입 때 받은 기록을 그대로 유지하므로 이 요청으로 갱신하지 않는다.
 */
export class AdopterCounselProfileUpdateDto {
    @ApiPropertyOptional({ description: '자기소개', example: '30대 1인가구, 재택근무 중심...' })
    @IsOptional()
    @IsString()
    selfIntroduction?: string;

    @ApiPropertyOptional({ description: '평균 집 비우는 시간', example: '평일 오전 9시~오후 6시' })
    @IsOptional()
    @IsString()
    dailyAbsenceHours?: string;

    @ApiPropertyOptional({ description: '거주 공간 소개', example: '24평 아파트, 거실 위주 생활' })
    @IsOptional()
    @IsString()
    livingSpaceDescription?: string;
}

export class AdopterProfileUpdateRequestDto {
    @ApiPropertyOptional({
        description: '입양자 이름',
        example: '홍길동',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: '입양자 전화번호',
        example: '010-1234-5678',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: '프로필 이미지 파일명 또는 URL',
        example: 'profiles/adopter-123.jpg',
    })
    @IsOptional()
    @IsString()
    profileImage?: string;

    @ApiPropertyOptional({
        description: '입양 상담 사전 정보 (공통 신청서) — 넘긴 필드만 부분 수정된다',
        type: AdopterCounselProfileUpdateDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => AdopterCounselProfileUpdateDto)
    counselDefaultProfile?: AdopterCounselProfileUpdateDto;
}

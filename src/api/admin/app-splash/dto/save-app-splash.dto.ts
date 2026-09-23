import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

/** 시작 지연과 잘못된 이미지 주소를 HTTP 경계에서 제한한다. */
export class SaveAppSplashDto {
    @ApiProperty()
    @IsBoolean()
    isEnabled: boolean;

    @ApiProperty({ description: 'app-splash 폴더에 업로드한 PNG/JPEG/WebP 파일키. 빈 문자열은 기본 로고.' })
    @IsString()
    @MaxLength(250)
    @Matches(/^(?:|app-splash\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp))$/i)
    imageFileName: string;

    @ApiProperty({ example: '#FFFFFF', pattern: '^#[0-9A-Fa-f]{6}$' })
    @Matches(/^#[0-9A-Fa-f]{6}$/)
    backgroundColor: string;

    @ApiProperty({ minimum: 80, maximum: 320, example: 200 })
    @IsInt()
    @Min(80)
    @Max(320)
    imageWidth: number;

    @ApiProperty({ minimum: 0, maximum: 3000, example: 1200 })
    @IsInt()
    @Min(0)
    @Max(3000)
    durationMs: number;
}

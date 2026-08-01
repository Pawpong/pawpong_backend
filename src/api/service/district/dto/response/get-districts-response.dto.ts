import { ApiProperty } from '@nestjs/swagger';

export class GetDistrictsResponseDto {
    @ApiProperty({
        description: '도/특별시/광역시',
        example: '경기도',
    })
    city: string;

    @ApiProperty({
        description: '시/군/구 목록',
        type: [String],
        example: ['수원시', '성남시', '고양시'],
    })
    districts: string[];

    constructor(city: string, districts: string[]) {
        this.city = city;
        this.districts = districts;
    }
}

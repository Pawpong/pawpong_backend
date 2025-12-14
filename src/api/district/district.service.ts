import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { District } from '../../schema/district.schema';

import { GetDistrictsResponseDto } from './dto/response/get-districts-response.dto';

// 대한민국 행정구역 표준 순서 (서울 → 광역시 → 도 → 제주)
const CITY_ORDER = [
    '서울특별시',
    '부산광역시',
    '대구광역시',
    '인천광역시',
    '광주광역시',
    '대전광역시',
    '울산광역시',
    '세종특별자치시',
    '경기도',
    '강원도',
    '충청북도',
    '충청남도',
    '전라북도',
    '전라남도',
    '경상북도',
    '경상남도',
    '제주특별자치도',
];

@Injectable()
export class DistrictService {
    constructor(@InjectModel(District.name) private readonly districtModel: Model<District>) {}

    /**
     * 모든 지역 데이터 조회 (city와 districts 전체 반환)
     * 대한민국 행정구역 표준 순서대로 정렬하여 반환합니다.
     */
    async getAllDistricts(): Promise<GetDistrictsResponseDto[]> {
        const districts = await this.districtModel.find().exec();
        const mappedDistricts = districts.map((d) => ({
            city: d.city,
            districts: d.districts,
        }));

        // 표준 순서대로 정렬
        return mappedDistricts.sort((a, b) => {
            const indexA = CITY_ORDER.indexOf(a.city);
            const indexB = CITY_ORDER.indexOf(b.city);
            // 순서에 없는 항목은 맨 뒤로
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }
}

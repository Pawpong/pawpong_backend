import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { SearchBreederRequestDto } from '../../dto/request/search-breeder-request.dto';

describe('SearchBreederRequestDto', () => {
    it('파충류 브리더 탐색 요청을 허용한다', async () => {
        const dto = plainToInstance(SearchBreederRequestDto, { petType: 'reptile' });

        await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('지원하지 않는 반려동물 타입은 거부한다', async () => {
        const dto = plainToInstance(SearchBreederRequestDto, { petType: 'bird' });

        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('petType');
    });
});

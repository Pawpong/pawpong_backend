import { BadRequestException } from '@nestjs/common';

import { PetType } from '../../../../common/enum/user.enum';
import { BreedPetTypePipe } from '../../pipe/breed-pet-type.pipe';

describe('품종 반려동물 타입 파이프', () => {
    const pipe = new BreedPetTypePipe();

    it('강아지 타입을 그대로 통과시킨다', () => {
        expect(pipe.transform('dog')).toBe(PetType.DOG);
    });

    it('고양이 타입을 그대로 통과시킨다', () => {
        expect(pipe.transform('cat')).toBe(PetType.CAT);
    });

    it('지원하지 않는 타입이면 예외를 던진다', () => {
        expect(() => pipe.transform('bird')).toThrow(BadRequestException);
        expect(() => pipe.transform('bird')).toThrow('petType은 dog 또는 cat이어야 합니다.');
    });
});

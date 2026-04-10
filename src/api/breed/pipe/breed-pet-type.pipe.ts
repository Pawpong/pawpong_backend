import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { PetType } from '../../../common/enum/user.enum';

@Injectable()
export class BreedPetTypePipe implements PipeTransform<string, PetType> {
    transform(value: string): PetType {
        if (value !== PetType.DOG && value !== PetType.CAT) {
            throw new BadRequestException('petType은 dog 또는 cat이어야 합니다.');
        }

        return value as PetType;
    }
}

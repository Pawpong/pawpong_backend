import { Injectable, PipeTransform } from '@nestjs/common';

import { DomainValidationError } from '../error/domain.error';
import { isMongoObjectId } from '../utils/mongo-object-id.util';

@Injectable()
export class MongoObjectIdPipe implements PipeTransform<string, string> {
    constructor(
        private readonly resourceName: string = '리소스',
        private readonly customMessage?: string,
    ) {}

    transform(value: string): string {
        if (!isMongoObjectId(value)) {
            throw new DomainValidationError(this.customMessage ?? `${this.resourceName} ID 형식이 올바르지 않습니다.`);
        }

        return value;
    }
}

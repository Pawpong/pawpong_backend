import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class MongoObjectIdPipe implements PipeTransform<string, string> {
    constructor(
        private readonly resourceName: string = '리소스',
        private readonly customMessage?: string,
    ) {}

    transform(value: string): string {
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException(this.customMessage ?? `${this.resourceName} ID 형식이 올바르지 않습니다.`);
        }

        return value;
    }
}

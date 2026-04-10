import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { BREEDER_PUBLIC_READER_PORT } from '../ports/breeder-public-reader.port';
import type { BreederPublicReaderPort } from '../ports/breeder-public-reader.port';
import { BreederPublicApplicationFormBuilderService } from '../../domain/services/breeder-public-application-form-builder.service';

@Injectable()
export class GetBreederApplicationFormUseCase {
    constructor(
        @Inject(BREEDER_PUBLIC_READER_PORT)
        private readonly breederPublicReaderPort: BreederPublicReaderPort,
        private readonly breederPublicApplicationFormBuilderService: BreederPublicApplicationFormBuilderService,
    ) {}

    async execute(breederId: string) {
        if (!Types.ObjectId.isValid(breederId)) {
            throw new BadRequestException('올바르지 않은 브리더 ID 형식입니다.');
        }

        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new BadRequestException('브리더를 찾을 수 없습니다.');
        }

        return this.breederPublicApplicationFormBuilderService.build(breeder.applicationForm || []);
    }
}

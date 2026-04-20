import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
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
        const breeder = await this.breederPublicReaderPort.findPublicBreederById(breederId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더를 찾을 수 없습니다.');
        }

        return this.breederPublicApplicationFormBuilderService.build(breeder.applicationForm || []);
    }
}

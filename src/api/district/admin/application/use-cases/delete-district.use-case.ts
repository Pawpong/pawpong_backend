import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../../common/error/domain.error';
import { DISTRICT_WRITER_PORT, type DistrictWriterPort } from '../ports/district-writer.port';

@Injectable()
export class DeleteDistrictUseCase {
    constructor(
        @Inject(DISTRICT_WRITER_PORT)
        private readonly districtWriter: DistrictWriterPort,
    ) {}

    async execute(id: string): Promise<void> {
        const deleted = await this.districtWriter.delete(id);

        if (!deleted) {
            throw new DomainNotFoundError(`ID ${id}에 해당하는 지역을 찾을 수 없습니다.`);
        }
    }
}

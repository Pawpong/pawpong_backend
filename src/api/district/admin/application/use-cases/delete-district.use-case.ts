import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { DISTRICT_WRITER, type DistrictWriterPort } from '../ports/district-writer.port';

@Injectable()
export class DeleteDistrictUseCase {
    constructor(
        @Inject(DISTRICT_WRITER)
        private readonly districtWriter: DistrictWriterPort,
    ) {}

    async execute(id: string): Promise<void> {
        const deleted = await this.districtWriter.delete(id);

        if (!deleted) {
            throw new BadRequestException(`ID ${id}에 해당하는 지역을 찾을 수 없습니다.`);
        }
    }
}

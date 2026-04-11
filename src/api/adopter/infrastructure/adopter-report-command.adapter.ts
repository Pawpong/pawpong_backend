import { Injectable } from '@nestjs/common';

import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import type { AdopterReportCommandPort } from '../application/ports/adopter-report-command.port';
import type { AdopterReportPayloadRecord } from '../types/adopter-report.type';

@Injectable()
export class AdopterReportCommandAdapter implements AdopterReportCommandPort {
    constructor(private readonly breederRepository: BreederRepository) {}

    addReport(breederId: string, reportData: AdopterReportPayloadRecord): Promise<void> {
        return this.breederRepository.addReport(breederId, reportData);
    }
}

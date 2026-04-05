import { Injectable } from '@nestjs/common';

import { BreederRepository } from '../../breeder-management/repository/breeder.repository';
import { AdopterReportCommandPort } from '../application/ports/adopter-report-command.port';

@Injectable()
export class AdopterReportCommandAdapter extends AdopterReportCommandPort {
    constructor(private readonly breederRepository: BreederRepository) {
        super();
    }

    addReport(breederId: string, reportData: any): Promise<void> {
        return this.breederRepository.addReport(breederId, reportData);
    }
}

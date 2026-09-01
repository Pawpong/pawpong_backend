import { Injectable } from '@nestjs/common';

import { DatabaseReadinessService } from '../../../../common/database/database-readiness.service';
import {
    type DatabaseReadinessReaderPort,
    type DatabaseReadinessSnapshot,
} from '../application/ports/database-readiness-reader.port';

@Injectable()
export class DatabaseReadinessMongooseAdapter implements DatabaseReadinessReaderPort {
    constructor(private readonly databaseReadinessService: DatabaseReadinessService) {}

    read(): Promise<DatabaseReadinessSnapshot> {
        return this.databaseReadinessService.check();
    }
}

import { ContestModule } from '../contest.module';

import { CONTEST_ADMIN_WRITER_PORT } from './application/ports/contest-admin-writer.port';
import { UpdateContestEntryStatusUseCase } from './application/use-cases/update-contest-entry-status.use-case';
import { ContestAdminEntryStatusController } from './controller/contest-admin-entry-status.controller';
import { ContestAdminWriterMongooseAdapter } from './infrastructure/contest-admin-writer-mongoose.adapter';

export const CONTEST_ADMIN_MODULE_IMPORTS = [ContestModule];

export const CONTEST_ADMIN_MODULE_CONTROLLERS = [ContestAdminEntryStatusController];

const CONTEST_ADMIN_USE_CASE_PROVIDERS = [UpdateContestEntryStatusUseCase];

const CONTEST_ADMIN_INFRASTRUCTURE_PROVIDERS = [ContestAdminWriterMongooseAdapter];

const CONTEST_ADMIN_PORT_BINDINGS = [
    { provide: CONTEST_ADMIN_WRITER_PORT, useExisting: ContestAdminWriterMongooseAdapter },
];

export const CONTEST_ADMIN_MODULE_PROVIDERS = [
    ...CONTEST_ADMIN_USE_CASE_PROVIDERS,
    ...CONTEST_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...CONTEST_ADMIN_PORT_BINDINGS,
];

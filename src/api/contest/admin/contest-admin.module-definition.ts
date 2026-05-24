import { MongooseModule } from '@nestjs/mongoose';

import { Contest, ContestSchema } from '../../../schema/contest.schema';
import { ContestEntry, ContestEntrySchema } from '../../../schema/contest-entry.schema';
import { ContestVote, ContestVoteSchema } from '../../../schema/contest-vote.schema';

import { CONTEST_READER_PORT } from '../application/ports/contest-reader.port';
import { ContestReaderMongooseAdapter } from '../infrastructure/contest-reader-mongoose.adapter';
import { ContestRepository } from '../repository/contest.repository';

import { CONTEST_ADMIN_WRITER_PORT } from './application/ports/contest-admin-writer.port';
import { UpdateContestEntryStatusUseCase } from './application/use-cases/update-contest-entry-status.use-case';
import { ContestAdminEntryStatusController } from './controller/contest-admin-entry-status.controller';
import { ContestAdminWriterMongooseAdapter } from './infrastructure/contest-admin-writer-mongoose.adapter';

const CONTEST_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Contest.name, schema: ContestSchema },
    { name: ContestEntry.name, schema: ContestEntrySchema },
    { name: ContestVote.name, schema: ContestVoteSchema },
]);

export const CONTEST_ADMIN_MODULE_IMPORTS = [CONTEST_ADMIN_SCHEMA_IMPORTS];

export const CONTEST_ADMIN_MODULE_CONTROLLERS = [ContestAdminEntryStatusController];

const USE_CASE_PROVIDERS = [UpdateContestEntryStatusUseCase];

const INFRASTRUCTURE_PROVIDERS = [
    ContestRepository,
    ContestReaderMongooseAdapter,
    ContestAdminWriterMongooseAdapter,
];

const PORT_BINDINGS = [
    { provide: CONTEST_READER_PORT, useExisting: ContestReaderMongooseAdapter },
    { provide: CONTEST_ADMIN_WRITER_PORT, useExisting: ContestAdminWriterMongooseAdapter },
];

export const CONTEST_ADMIN_MODULE_PROVIDERS = [
    ...USE_CASE_PROVIDERS,
    ...INFRASTRUCTURE_PROVIDERS,
    ...PORT_BINDINGS,
];

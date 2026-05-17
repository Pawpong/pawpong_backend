import { MongooseModule } from '@nestjs/mongoose';

import { StorageModule } from '../../common/storage/storage.module';
import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Contest, ContestSchema } from '../../schema/contest.schema';
import { ContestEntry, ContestEntrySchema } from '../../schema/contest-entry.schema';
import { ContestVote, ContestVoteSchema } from '../../schema/contest-vote.schema';

import { CONTEST_ASSET_URL_PORT } from './application/ports/contest-asset-url.port';
import { CONTEST_READER_PORT } from './application/ports/contest-reader.port';
import { CONTEST_USER_INFO_PORT } from './application/ports/contest-user-info.port';
import { CONTEST_WRITER_PORT } from './application/ports/contest-writer.port';
import { GetCurrentContestUseCase } from './application/use-cases/get-current-contest.use-case';
import { GetContestEntriesUseCase } from './application/use-cases/get-contest-entries.use-case';
import { SubmitContestEntryUseCase } from './application/use-cases/submit-contest-entry.use-case';
import { VoteContestEntryUseCase } from './application/use-cases/vote-contest-entry.use-case';
import { GetMyContestEntryUseCase } from './application/use-cases/get-my-contest-entry.use-case';
import { GetPreviousRankingUseCase } from './application/use-cases/get-previous-ranking.use-case';
import { GetHallOfFameUseCase } from './application/use-cases/get-hall-of-fame.use-case';
import { ContestCurrentController } from './controller/contest-current.controller';
import { ContestEntriesController } from './controller/contest-entries.controller';
import { ContestEntrySubmitController } from './controller/contest-entry-submit.controller';
import { ContestHallOfFameController } from './controller/contest-hall-of-fame.controller';
import { ContestMeController } from './controller/contest-me.controller';
import { ContestPreviousRankingController } from './controller/contest-previous-ranking.controller';
import { ContestVoteController } from './controller/contest-vote.controller';
import { ContestAssetUrlStorageAdapter } from './infrastructure/contest-asset-url-storage.adapter';
import { ContestReaderMongooseAdapter } from './infrastructure/contest-reader-mongoose.adapter';
import { ContestUserInfoMongooseAdapter } from './infrastructure/contest-user-info-mongoose.adapter';
import { ContestWriterMongooseAdapter } from './infrastructure/contest-writer-mongoose.adapter';
import { ContestRepository } from './repository/contest.repository';

const SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Contest.name, schema: ContestSchema },
    { name: ContestEntry.name, schema: ContestEntrySchema },
    { name: ContestVote.name, schema: ContestVoteSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const CONTEST_MODULE_IMPORTS = [SCHEMA_IMPORTS, StorageModule];

export const CONTEST_MODULE_CONTROLLERS = [
    ContestCurrentController,
    ContestEntriesController,
    ContestEntrySubmitController,
    ContestVoteController,
    ContestMeController,
    ContestPreviousRankingController,
    ContestHallOfFameController,
];

const USE_CASE_PROVIDERS = [
    GetCurrentContestUseCase,
    GetContestEntriesUseCase,
    SubmitContestEntryUseCase,
    VoteContestEntryUseCase,
    GetMyContestEntryUseCase,
    GetPreviousRankingUseCase,
    GetHallOfFameUseCase,
];

const INFRASTRUCTURE_PROVIDERS = [
    ContestRepository,
    ContestReaderMongooseAdapter,
    ContestWriterMongooseAdapter,
    ContestAssetUrlStorageAdapter,
    ContestUserInfoMongooseAdapter,
];

const PORT_BINDINGS = [
    { provide: CONTEST_READER_PORT, useExisting: ContestReaderMongooseAdapter },
    { provide: CONTEST_WRITER_PORT, useExisting: ContestWriterMongooseAdapter },
    { provide: CONTEST_ASSET_URL_PORT, useExisting: ContestAssetUrlStorageAdapter },
    { provide: CONTEST_USER_INFO_PORT, useExisting: ContestUserInfoMongooseAdapter },
];

export const CONTEST_MODULE_PROVIDERS = [...USE_CASE_PROVIDERS, ...INFRASTRUCTURE_PROVIDERS, ...PORT_BINDINGS];

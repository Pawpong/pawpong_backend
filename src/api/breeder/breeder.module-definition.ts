import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { AvailablePet, AvailablePetSchema } from '../../schema/available-pet.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { BreederReview, BreederReviewSchema } from '../../schema/breeder-review.schema';
import { ParentPet, ParentPetSchema } from '../../schema/parent-pet.schema';
import { StorageModule } from '../../common/storage/storage.module';

import { BREEDER_FILE_URL_PORT } from './application/ports/breeder-file-url.port';
import { BREEDER_PUBLIC_READER_PORT } from './application/ports/breeder-public-reader.port';
import { ExploreBreedersUseCase } from './application/use-cases/explore-breeders.use-case';
import { GetBreederApplicationFormUseCase } from './application/use-cases/get-breeder-application-form.use-case';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetBreederReviewsUseCase } from './application/use-cases/get-breeder-reviews.use-case';
import { GetPopularBreedersUseCase } from './application/use-cases/get-popular-breeders.use-case';
import { SearchBreedersUseCase } from './application/use-cases/search-breeders.use-case';
import { BreederDiscoveryController, BreederExploreController } from './breeder-discovery.controller';
import { BreederPetDetailController, BreederPetsController } from './breeder-pets.controller';
import { BreederApplicationFormController, BreederProfileController } from './breeder-profile.controller';
import { BreederReviewsController } from './breeder-reviews.controller';
import { BreederBirthDateFormatterService } from './domain/services/breeder-birth-date-formatter.service';
import { BreederExploreCardMapperService } from './domain/services/breeder-explore-card-mapper.service';
import { BreederExploreCriteriaService } from './domain/services/breeder-explore-criteria.service';
import { BreederExploreFavoriteReaderService } from './domain/services/breeder-explore-favorite-reader.service';
import { BreederPaginationAssemblerService } from './domain/services/breeder-pagination-assembler.service';
import { BreederPublicApplicationFormBuilderService } from './domain/services/breeder-public-application-form-builder.service';
import { BreederPublicParentPetListAssemblerService } from './domain/services/breeder-public-parent-pet-list-assembler.service';
import { BreederPublicPetDetailAssemblerService } from './domain/services/breeder-public-pet-detail-assembler.service';
import { BreederPublicPetPageAssemblerService } from './domain/services/breeder-public-pet-page-assembler.service';
import { BreederPublicProfileAssemblerService } from './domain/services/breeder-public-profile-assembler.service';
import { BreederPublicReviewPageAssemblerService } from './domain/services/breeder-public-review-page-assembler.service';
import { BreederSearchCriteriaService } from './domain/services/breeder-search-criteria.service';
import { BreederSearchResultMapperService } from './domain/services/breeder-search-result-mapper.service';
import { BreederFileUrlAdapter } from './infrastructure/breeder-file-url.adapter';
import { BreederPublicReaderAdapter } from './infrastructure/breeder-public-reader.adapter';
import { BreederPublicRepository } from './repository/breeder-public.repository';

const BREEDER_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: BreederReview.name, schema: BreederReviewSchema },
    { name: ParentPet.name, schema: ParentPetSchema },
    { name: AvailablePet.name, schema: AvailablePetSchema },
]);

export const BREEDER_MODULE_IMPORTS = [BREEDER_SCHEMA_IMPORTS, StorageModule];

export const BREEDER_MODULE_CONTROLLERS = [
    BreederDiscoveryController,
    BreederExploreController,
    BreederProfileController,
    BreederApplicationFormController,
    BreederPetsController,
    BreederPetDetailController,
    BreederReviewsController,
];

const BREEDER_USE_CASE_PROVIDERS = [
    SearchBreedersUseCase,
    ExploreBreedersUseCase,
    GetPopularBreedersUseCase,
    GetBreederProfileUseCase,
    GetBreederReviewsUseCase,
    GetBreederPetsUseCase,
    GetBreederPetDetailUseCase,
    GetBreederParentPetsUseCase,
    GetBreederApplicationFormUseCase,
];

const BREEDER_DOMAIN_PROVIDERS = [
    BreederSearchCriteriaService,
    BreederSearchResultMapperService,
    BreederExploreCriteriaService,
    BreederExploreFavoriteReaderService,
    BreederExploreCardMapperService,
    BreederBirthDateFormatterService,
    BreederPaginationAssemblerService,
    BreederPublicProfileAssemblerService,
    BreederPublicReviewPageAssemblerService,
    BreederPublicPetPageAssemblerService,
    BreederPublicParentPetListAssemblerService,
    BreederPublicApplicationFormBuilderService,
    BreederPublicPetDetailAssemblerService,
];

const BREEDER_INFRASTRUCTURE_PROVIDERS = [BreederPublicRepository, BreederFileUrlAdapter, BreederPublicReaderAdapter];

const BREEDER_PORT_BINDINGS = [
    {
        provide: BREEDER_FILE_URL_PORT,
        useExisting: BreederFileUrlAdapter,
    },
    {
        provide: BREEDER_PUBLIC_READER_PORT,
        useExisting: BreederPublicReaderAdapter,
    },
];

export const BREEDER_MODULE_PROVIDERS = [
    ...BREEDER_USE_CASE_PROVIDERS,
    ...BREEDER_DOMAIN_PROVIDERS,
    ...BREEDER_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_PORT_BINDINGS,
];

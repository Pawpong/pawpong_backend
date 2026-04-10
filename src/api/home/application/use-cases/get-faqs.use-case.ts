import { Inject, Injectable } from '@nestjs/common';

import { HomeFaqCatalogService } from '../../domain/services/home-faq-catalog.service';
import { HOME_CONTENT_READER, type HomeContentReaderPort } from '../ports/home-content-reader.port';
import type { HomeFaqResult } from '../types/home-content-result.type';

@Injectable()
export class GetFaqsUseCase {
    constructor(
        @Inject(HOME_CONTENT_READER)
        private readonly homeContentReader: HomeContentReaderPort,
        private readonly homeFaqCatalogService: HomeFaqCatalogService,
    ) {}

    async execute(userType: string = 'adopter'): Promise<HomeFaqResult[]> {
        const audience = userType === 'breeder' ? 'breeder' : 'adopter';
        const faqs = await this.homeContentReader.readFaqsFor(audience);

        return this.homeFaqCatalogService.buildResults(faqs);
    }
}

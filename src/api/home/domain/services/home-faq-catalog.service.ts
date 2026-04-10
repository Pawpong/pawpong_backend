import { Injectable } from '@nestjs/common';

import { HomeFaqSnapshot } from '../../application/ports/home-content-reader.port';
import type { HomeFaqResult } from '../../application/types/home-content-result.type';

@Injectable()
export class HomeFaqCatalogService {
    buildResults(faqs: HomeFaqSnapshot[]): HomeFaqResult[] {
        return faqs.map((faq) => ({
            faqId: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            userType: faq.userType,
            order: faq.order,
        }));
    }
}

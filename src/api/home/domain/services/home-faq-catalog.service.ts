import { Injectable } from '@nestjs/common';

import { FaqResponseDto } from '../../dto/response/faq-response.dto';
import { HomeFaqSnapshot } from '../../application/ports/home-content-reader.port';

@Injectable()
export class HomeFaqCatalogService {
    buildResponse(faqs: HomeFaqSnapshot[]): FaqResponseDto[] {
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

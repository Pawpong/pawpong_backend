import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { SupportInquiryResponseDto } from '../dto/response/support-inquiry-response.dto';

export const ApiSupportInquiryEndpoint = () =>
    ApiEndpoint({
        summary: 'AI FAQ 문의 안내',
        description:
            '현행 공개 FAQ 원문을 AI로 검색합니다. 담당자 접수나 계정 처리는 수행하지 않습니다. 요청 제한 429, Agent 장애 503.',
        responseType: SupportInquiryResponseDto,
        isPublic: true,
    });

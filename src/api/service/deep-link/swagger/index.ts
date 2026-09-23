import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { DeepLinkResponseDto } from '../dto/response/deep-link-response.dto';

export const ApiResolveDeepLink = () =>
    ApiEndpoint({
        summary: '활성 공유 링크 조회',
        responseType: DeepLinkResponseDto,
        isPublic: true,
        errorResponses: [{ status: 404, description: '없거나 비활성인 링크' }],
    });

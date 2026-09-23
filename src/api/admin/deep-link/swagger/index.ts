import { ApiEndpoint, ApiPaginatedEndpoint } from '../../../../common/decorator/swagger.decorator';
import { DeepLinkAdminResponseDto } from '../dto/response/deep-link-admin-response.dto';

export const ApiListDeepLinks = () =>
    ApiPaginatedEndpoint({
        summary: '공유 링크 목록 조회',
        responseType: DeepLinkAdminResponseDto,
        itemType: DeepLinkAdminResponseDto,
    });
export const ApiSaveDeepLink = () =>
    ApiEndpoint({
        summary: '공유 링크 저장',
        responseType: DeepLinkAdminResponseDto,
        errorResponses: [{ status: 409, description: '슬러그 중복' }],
    });
export const ApiDeleteDeepLink = () => ApiEndpoint({ summary: '공유 링크 삭제', nullableData: true });

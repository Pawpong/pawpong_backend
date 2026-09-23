import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AppSplashResponseDto } from '../dto/app-splash-response.dto';

/** 앱 시작 시 로그인 없이 필요한 표시 설정만 반환한다. */
export const ApiGetAppSplash = () =>
    ApiEndpoint({ summary: '앱 스플래시 조회', isPublic: true, responseType: AppSplashResponseDto });

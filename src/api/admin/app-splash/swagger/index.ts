import { ApiEndpoint } from '../../../../common/decorator/swagger.decorator';
import { AppSplashResponseDto } from '../../../service/app-splash/dto/app-splash-response.dto';

/** 관리자 전용 조회 및 저장 계약. */
export const ApiListAppSplashes = () =>
    ApiEndpoint({ summary: '플랫폼별 앱 스플래시 설정 조회', responseType: [AppSplashResponseDto] });
export const ApiSaveAppSplash = () =>
    ApiEndpoint({ summary: '앱 스플래시 설정 저장', responseType: AppSplashResponseDto });

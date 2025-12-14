import { SetMetadata } from '@nestjs/common';

/**
 * Public 데코레이터
 *
 * 이 데코레이터가 적용된 엔드포인트는 JWT 인증을 건너뜁니다.
 * 컨트롤러 레벨에 JwtAuthGuard가 적용되어 있어도, 이 데코레이터가 있으면 인증을 건너뜁니다.
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('public-endpoint')
 * async publicEndpoint() {
 *   return { message: 'This endpoint is public' };
 * }
 * ```
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

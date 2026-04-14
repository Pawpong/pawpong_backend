import { Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthSocialHttpFlowFacade } from './presentation/services/auth-social-http-flow.facade';
import { ApiKakaoCallbackEndpoint, ApiKakaoLoginEndpoint } from './swagger';

@AuthPublicController()
export class AuthKakaoLoginController {
    constructor(private readonly authSocialHttpFlowFacade: AuthSocialHttpFlowFacade) {}

    @Get('kakao')
    @ApiKakaoLoginEndpoint()
    kakaoLogin(@Req() req, @Res() res: Response) {
        return res.redirect(
            this.authSocialHttpFlowFacade.getRedirectUrl(
                'kakao',
                req.headers.referer,
                req.headers.origin,
                req.query.returnUrl as string | undefined,
            ),
        );
    }

    @Get('kakao/callback')
    @UseGuards(AuthGuard('kakao'))
    @ApiKakaoCallbackEndpoint()
    async kakaoCallback(@Req() req, @Res() res: Response) {
        return this.authSocialHttpFlowFacade.handleCallback(req.user, res);
    }
}

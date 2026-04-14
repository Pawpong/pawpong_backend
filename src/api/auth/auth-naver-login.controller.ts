import { Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthSocialHttpFlowFacade } from './presentation/services/auth-social-http-flow.facade';
import { ApiNaverCallbackEndpoint, ApiNaverLoginEndpoint } from './swagger';

@AuthPublicController()
export class AuthNaverLoginController {
    constructor(private readonly authSocialHttpFlowFacade: AuthSocialHttpFlowFacade) {}

    @Get('naver')
    @ApiNaverLoginEndpoint()
    naverLogin(@Req() req, @Res() res: Response) {
        return res.redirect(
            this.authSocialHttpFlowFacade.getRedirectUrl(
                'naver',
                req.headers.referer,
                req.headers.origin,
                req.query.returnUrl as string | undefined,
            ),
        );
    }

    @Get('naver/callback')
    @UseGuards(AuthGuard('naver'))
    @ApiNaverCallbackEndpoint()
    async naverCallback(@Req() req, @Res() res: Response) {
        return this.authSocialHttpFlowFacade.handleCallback(req.user, res);
    }
}

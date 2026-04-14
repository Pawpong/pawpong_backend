import { Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthSocialHttpFlowFacade } from './presentation/services/auth-social-http-flow.facade';
import { ApiGoogleCallbackEndpoint, ApiGoogleLoginEndpoint } from './swagger';

@AuthPublicController()
export class AuthGoogleLoginController {
    constructor(private readonly authSocialHttpFlowFacade: AuthSocialHttpFlowFacade) {}

    @Get('google')
    @ApiGoogleLoginEndpoint()
    googleLogin(@Req() req, @Res() res: Response) {
        return res.redirect(
            this.authSocialHttpFlowFacade.getRedirectUrl(
                'google',
                req.headers.referer,
                req.headers.origin,
                req.query.returnUrl as string | undefined,
            ),
        );
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiGoogleCallbackEndpoint()
    async googleCallback(@Req() req, @Res() res: Response) {
        return this.authSocialHttpFlowFacade.handleCallback(req.user, res);
    }
}

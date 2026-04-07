import { Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthSocialHttpFlowService } from './domain/services/auth-social-http-flow.service';
import { ApiNaverCallbackEndpoint, ApiNaverLoginEndpoint } from './swagger';

@AuthPublicController()
export class AuthNaverLoginController {
    constructor(private readonly authSocialHttpFlowService: AuthSocialHttpFlowService) {}

    @Get('naver')
    @ApiNaverLoginEndpoint()
    naverLogin(@Req() req, @Res() res: Response) {
        return res.redirect(
            this.authSocialHttpFlowService.getRedirectUrl(
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
        return this.authSocialHttpFlowService.handleCallback(req.user, res);
    }
}

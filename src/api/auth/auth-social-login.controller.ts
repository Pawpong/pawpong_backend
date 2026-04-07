import { Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthSocialHttpFlowService } from './domain/services/auth-social-http-flow.service';
import {
    ApiGoogleCallbackEndpoint,
    ApiGoogleLoginEndpoint,
    ApiKakaoCallbackEndpoint,
    ApiKakaoLoginEndpoint,
    ApiNaverCallbackEndpoint,
    ApiNaverLoginEndpoint,
} from './swagger';

@AuthPublicController()
export class AuthSocialLoginController {
    constructor(private readonly authSocialHttpFlowService: AuthSocialHttpFlowService) {}

    @Get('google')
    @ApiGoogleLoginEndpoint()
    googleLogin(@Req() req, @Res() res: Response) {
        return res.redirect(
            this.authSocialHttpFlowService.getRedirectUrl(
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
        return this.authSocialHttpFlowService.handleCallback(req.user, res);
    }

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

    @Get('kakao')
    @ApiKakaoLoginEndpoint()
    kakaoLogin(@Req() req, @Res() res: Response) {
        return res.redirect(
            this.authSocialHttpFlowService.getRedirectUrl(
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
        return this.authSocialHttpFlowService.handleCallback(req.user, res);
    }
}

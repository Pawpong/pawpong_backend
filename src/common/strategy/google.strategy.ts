import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import type { GoogleOAuthProfile, OAuthStateRequest, SocialOAuthUser } from '../types/social-oauth.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
            scope: ['email', 'profile'],
            passReqToCallback: true, // req 객체를 validate에 전달
        });
    }

    async validate(
        req: OAuthStateRequest,
        accessToken: string,
        refreshToken: string,
        profile: GoogleOAuthProfile,
        done: VerifyCallback,
    ): Promise<void> {
        const { id, name, emails, photos } = profile;
        const email = emails?.[0]?.value || `google_${id}@temp.pawpong.com`;

        // state 파라미터에서 origin 정보 추출 (OAuth 시작 시 전달됨)
        const originFromState = req.query?.state || '';

        const user: SocialOAuthUser = {
            provider: 'google',
            providerId: id,
            email,
            name: name?.givenName || name?.familyName || email.split('@')[0],
            profileImage: photos?.[0]?.value,
            originUrl: originFromState, // 원래 origin 정보 전달
        };

        void accessToken;
        void refreshToken;
        done(null, user);
    }
}

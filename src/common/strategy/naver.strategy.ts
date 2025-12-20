import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('NAVER_CLIENT_ID'),
            clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
            callbackURL: configService.get<string>('NAVER_CALLBACK_URL'),
            passReqToCallback: true, // req 객체를 validate에 전달
        });
    }

    async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
        const { id, email, nickname, profile_image } = profile._json;

        // state 파라미터에서 origin 정보 추출 (OAuth 시작 시 전달됨)
        const originFromState = req.query?.state || '';

        const user = {
            provider: 'naver',
            providerId: id,
            email: email,
            name: nickname || email.split('@')[0],
            profileImage: profile_image,
            originUrl: originFromState, // 원래 origin 정보 전달
        };

        done(null, user);
    }
}

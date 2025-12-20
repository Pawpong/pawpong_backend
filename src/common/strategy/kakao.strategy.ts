import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('KAKAO_CLIENT_ID') || '',
            clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET') || '',
            callbackURL: configService.get<string>('KAKAO_CALLBACK_URL') || '',
            passReqToCallback: true, // req 객체를 validate에 전달
        });
    }

    async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
        const { id, username, _json } = profile;
        const kakaoAccount = _json?.kakao_account;

        // 이메일이 없는 경우 providerId로 임시 이메일 생성
        const email = kakaoAccount?.email || `kakao_${id}@temp.pawpong.com`;
        const nickname = kakaoAccount?.profile?.nickname || username || `카카오사용자${id}`;

        // state 파라미터에서 origin 정보 추출 (OAuth 시작 시 전달됨)
        const originFromState = req.query?.state || '';

        const user = {
            provider: 'kakao',
            providerId: id.toString(),
            email: email,
            name: nickname,
            profileImage: kakaoAccount?.profile?.profile_image_url,
            needsEmail: !kakaoAccount?.email, // 이메일 제공 여부 플래그
            originUrl: originFromState, // 원래 origin 정보 전달
        };

        done(null, user);
    }
}

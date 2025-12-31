import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { Adopter, AdopterDocument } from '../../schema/adopter.schema';
import { Breeder, BreederDocument } from '../../schema/breeder.schema';

/**
 * JWT 전략 클래스
 * JWT 토큰 검증 및 사용자 인증을 담당합니다.
 * 쿠키와 Authorization 헤더 둘 다에서 토큰을 추출합니다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger('JWT');

    constructor(
        configService: ConfigService,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET') || 'fallback-secret';

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 1순위: 쿠키에서 토큰 추출
                (request: Request) => {
                    let token: string | null = null;
                    if (request && request.cookies) {
                        token = request.cookies['accessToken'];
                    }
                    return token;
                },
                // 2순위: Authorization 헤더에서 토큰 추출 (fallback)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    /**
     * JWT 페이로드 검증
     * 토큰이 유효할 때 호출되어 사용자 정보를 반환합니다.
     * 탈퇴된 계정인 경우 UnauthorizedException을 발생시킵니다.
     */
    async validate(payload: any) {
        // 사용자 조회 및 탈퇴 여부 확인
        let accountStatus: string | undefined;
        if (payload.role === 'adopter') {
            const adopter = await this.adopterModel.findById(payload.sub).select('accountStatus').lean().exec();
            accountStatus = adopter?.accountStatus;
        } else if (payload.role === 'breeder') {
            const breeder = await this.breederModel.findById(payload.sub).select('accountStatus').lean().exec();
            accountStatus = breeder?.accountStatus;
        }

        // 탈퇴된 계정인 경우 인증 실패
        if (accountStatus === 'deleted') {
            this.logger.warn(`탈퇴된 계정 접근 시도: ${payload.sub}`);
            throw new UnauthorizedException('이미 탈퇴된 계정입니다.');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
            adminLevel: payload.adminLevel,
        };
    }
}

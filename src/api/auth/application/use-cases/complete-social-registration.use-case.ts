import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import type {
    RegisterAdopterAuthSignupPort,
    RegisterBreederAuthSignupPort,
} from '../ports/auth-signup-completion.port';
import {
    REGISTER_ADOPTER_AUTH_SIGNUP,
    REGISTER_BREEDER_AUTH_SIGNUP,
} from '../tokens/auth-signup-completion.token';
import {
    type CompleteSocialRegistrationCommand,
    type RegisterAdopterAuthSignupCommand,
    type RegisterAdopterAuthSignupResult,
    type RegisterBreederAuthSignupCommand,
    type RegisterBreederAuthSignupResult,
} from '../types/auth-signup.type';

@Injectable()
export class CompleteSocialRegistrationUseCase {
    constructor(
        @Inject(REGISTER_ADOPTER_AUTH_SIGNUP)
        private readonly registerAdopterUseCase: RegisterAdopterAuthSignupPort,
        @Inject(REGISTER_BREEDER_AUTH_SIGNUP)
        private readonly registerBreederUseCase: RegisterBreederAuthSignupPort,
    ) {}

    async execute(
        dto: CompleteSocialRegistrationCommand,
    ): Promise<RegisterAdopterAuthSignupResult | RegisterBreederAuthSignupResult> {
        if (dto.role === 'adopter') {
            if (!dto.nickname) {
                throw new BadRequestException('입양자 회원가입 시 닉네임은 필수입니다.');
            }

            const adopterDto: RegisterAdopterAuthSignupCommand = {
                tempId: dto.tempId,
                email: dto.email,
                nickname: dto.nickname,
                phone: dto.phone,
                marketingAgreed: dto.marketingAgreed,
            };

            return this.registerAdopterUseCase.execute(adopterDto);
        }

        if (dto.role === 'breeder') {
            if (!dto.phone) {
                throw new BadRequestException('브리더 회원가입 시 전화번호는 필수입니다.');
            }
            if (!dto.breederName) {
                throw new BadRequestException('브리더 회원가입 시 브리더명은 필수입니다.');
            }
            if (!dto.city) {
                throw new BadRequestException('브리더 회원가입 시 시/도는 필수입니다.');
            }
            if (!dto.petType) {
                throw new BadRequestException('브리더 회원가입 시 브리딩 동물 종류는 필수입니다.');
            }
            if (!dto.breeds || dto.breeds.length === 0) {
                throw new BadRequestException('브리더 회원가입 시 품종 목록은 필수입니다.');
            }
            if (!dto.plan) {
                throw new BadRequestException('브리더 회원가입 시 플랜은 필수입니다.');
            }
            if (!dto.level) {
                throw new BadRequestException('브리더 회원가입 시 레벨은 필수입니다.');
            }

            const breederDto: RegisterBreederAuthSignupCommand = {
                tempId: dto.tempId,
                provider: dto.provider,
                email: dto.email,
                phoneNumber: dto.phone,
                breederName: dto.breederName,
                breederLocation: {
                    city: dto.city,
                    district: dto.district,
                },
                animal: dto.petType,
                breeds: dto.breeds,
                plan: dto.plan,
                level: dto.level,
                agreements: {
                    termsOfService: true,
                    privacyPolicy: true,
                    marketingConsent: dto.marketingAgreed ?? false,
                },
            };

            return this.registerBreederUseCase.execute(breederDto);
        }

        throw new BadRequestException('유효하지 않은 역할입니다.');
    }
}

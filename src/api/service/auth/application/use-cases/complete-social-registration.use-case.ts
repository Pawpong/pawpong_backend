import { Inject, Injectable } from '@nestjs/common';

import type {
    RegisterAdopterAuthSignupPort,
    RegisterBreederAuthSignupPort,
} from '../ports/auth-signup-completion.port';
import { REGISTER_ADOPTER_AUTH_SIGNUP, REGISTER_BREEDER_AUTH_SIGNUP } from '../tokens/auth-signup-completion.token';
import {
    type CompleteSocialRegistrationCommand,
    type RegisterAdopterAuthSignupCommand,
    type RegisterAdopterAuthSignupResult,
    type RegisterBreederAuthSignupCommand,
    type RegisterBreederAuthSignupResult,
} from '../types/auth-signup.type';
import { AuthSignupValidationService } from '../../domain/services/auth-signup-validation.service';

@Injectable()
export class CompleteSocialRegistrationUseCase {
    constructor(
        @Inject(REGISTER_ADOPTER_AUTH_SIGNUP)
        private readonly registerAdopterUseCase: RegisterAdopterAuthSignupPort,
        @Inject(REGISTER_BREEDER_AUTH_SIGNUP)
        private readonly registerBreederUseCase: RegisterBreederAuthSignupPort,
        private readonly authSignupValidationService: AuthSignupValidationService,
    ) {}

    async execute(
        dto: CompleteSocialRegistrationCommand,
    ): Promise<RegisterAdopterAuthSignupResult | RegisterBreederAuthSignupResult> {
        if (dto.role === 'adopter') {
            this.authSignupValidationService.ensureCompleteSocialAdopterInput(dto.nickname);

            const adopterDto: RegisterAdopterAuthSignupCommand = {
                tempId: dto.tempId,
                email: dto.email,
                nickname: dto.nickname!,
                phone: dto.phone,
                profileImage: dto.profileImage,
                marketingAgreed: dto.marketingAgreed,
            };

            return this.registerAdopterUseCase.execute(adopterDto);
        }

        if (dto.role === 'breeder') {
            this.authSignupValidationService.ensureCompleteSocialBreederInput(dto);

            const breederDto: RegisterBreederAuthSignupCommand = {
                tempId: dto.tempId,
                provider: dto.provider,
                // 입양자와 동일하게 사전 업로드한 프로필 이미지를 등록에 반영한다.
                // (전달되지 않으면 register-breeder 가 tempId 임시저장소 값으로 폴백)
                profileImage: dto.profileImage,
                email: dto.email,
                phoneNumber: dto.phone!,
                breederName: dto.breederName!,
                breederLocation: {
                    city: dto.city!,
                    district: dto.district,
                },
                animal: dto.petType!,
                breeds: dto.breeds!,
                plan: dto.plan!,
                level: dto.level!,
                agreements: {
                    termsOfService: true,
                    privacyPolicy: true,
                    marketingConsent: dto.marketingAgreed ?? false,
                },
            };

            return this.registerBreederUseCase.execute(breederDto);
        }

        this.authSignupValidationService.throwInvalidRole();
    }
}

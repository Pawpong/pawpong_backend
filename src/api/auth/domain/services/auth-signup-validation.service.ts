import { Injectable } from '@nestjs/common';

import { DomainConflictError, DomainValidationError } from '../../../../common/error/domain.error';
import type { CompleteSocialRegistrationCommand } from '../../application/types/auth-signup.type';

@Injectable()
export class AuthSignupValidationService {
    ensureAdopterRegistrationInput(email?: string, nickname?: string): void {
        if (!email) {
            throw new DomainValidationError('이메일 정보가 필요합니다.');
        }

        if (!nickname) {
            throw new DomainValidationError('닉네임이 필요합니다.');
        }
    }

    ensureRequiredBreederAgreements(agreements?: { termsOfService?: boolean; privacyPolicy?: boolean }): void {
        if (!agreements?.termsOfService || !agreements?.privacyPolicy) {
            throw new DomainValidationError('필수 약관에 동의해야 합니다.');
        }
    }

    assertAdopterSocialAccountAvailable(existingAdopter: unknown): void {
        if (existingAdopter) {
            throw new DomainConflictError('이미 입양자로 가입된 소셜 계정입니다.');
        }
    }

    assertAdopterNicknameAvailable(existingNickname: unknown): void {
        if (existingNickname) {
            throw new DomainConflictError('이미 사용 중인 닉네임입니다.');
        }
    }

    assertBreederEmailAvailable(existingBreeder: unknown): void {
        if (existingBreeder) {
            throw new DomainConflictError('이미 가입된 이메일입니다.');
        }
    }

    assertBreederAdopterEmailAvailable(existingAdopter: unknown): void {
        if (existingAdopter) {
            throw new DomainConflictError('해당 이메일로 입양자 계정이 이미 존재합니다.');
        }
    }

    ensureCompleteSocialAdopterInput(nickname?: string): void {
        if (!nickname) {
            throw new DomainValidationError('입양자 회원가입 시 닉네임은 필수입니다.');
        }
    }

    ensureCompleteSocialBreederInput(dto: CompleteSocialRegistrationCommand): void {
        if (!dto.phone) {
            throw new DomainValidationError('브리더 회원가입 시 전화번호는 필수입니다.');
        }
        if (!dto.breederName) {
            throw new DomainValidationError('브리더 회원가입 시 브리더명은 필수입니다.');
        }
        if (!dto.city) {
            throw new DomainValidationError('브리더 회원가입 시 시/도는 필수입니다.');
        }
        if (!dto.petType) {
            throw new DomainValidationError('브리더 회원가입 시 브리딩 동물 종류는 필수입니다.');
        }
        if (!dto.breeds || dto.breeds.length === 0) {
            throw new DomainValidationError('브리더 회원가입 시 품종 목록은 필수입니다.');
        }
        if (!dto.plan) {
            throw new DomainValidationError('브리더 회원가입 시 플랜은 필수입니다.');
        }
        if (!dto.level) {
            throw new DomainValidationError('브리더 회원가입 시 레벨은 필수입니다.');
        }
    }

    throwInvalidRole(): never {
        throw new DomainValidationError('유효하지 않은 역할입니다.');
    }

    assertLegacyAdopterNicknameAvailable(existingNickname: unknown): void {
        if (existingNickname) {
            throw new DomainConflictError('Nickname already exists');
        }
    }

    ensureLegacyBreederInput(breederName?: string, district?: string, breeds?: string[]): void {
        if (!breederName || !district) {
            throw new DomainValidationError('브리더는 브리더명, 지역이 필요합니다.');
        }

        if (!breeds || breeds.length === 0) {
            throw new DomainValidationError('최소 1개의 품종이 필요합니다.');
        }
    }
}

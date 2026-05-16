import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { GetMyProfileUseCase } from './get-my-profile.use-case';
import type { MyProfileResponseDto } from '../../dto/response/my-profile-response.dto';
import {
    PROFILE_WRITER_PORT,
    type ProfileUpdatableRole,
    type ProfileWriterPort,
    type UpdateMyProfileCommand,
    type UpdateMyProfileLocation,
} from '../ports/profile-writer.port';

const BIO_MAX_LENGTH = 200;
const LOCATION_CITY_MAX = 50;
const LOCATION_DISTRICT_MAX = 50;
const LOCATION_ADDRESS_MAX = 200;

@Injectable()
export class UpdateMyProfileUseCase {
    constructor(
        @Inject(PROFILE_WRITER_PORT)
        private readonly writer: ProfileWriterPort,
        private readonly getMyProfileUseCase: GetMyProfileUseCase,
    ) {}

    async execute(
        userId: string,
        role: ProfileUpdatableRole,
        command: UpdateMyProfileCommand,
    ): Promise<MyProfileResponseDto> {
        const sanitized = this.sanitize(role, command);

        const updated = await this.writer.updateMyProfile(userId, role, sanitized);
        if (!updated) {
            throw new BadRequestException('프로필 정보를 찾을 수 없습니다.');
        }

        return this.getMyProfileUseCase.execute(userId, role);
    }

    private sanitize(role: ProfileUpdatableRole, command: UpdateMyProfileCommand): UpdateMyProfileCommand {
        const sanitized: UpdateMyProfileCommand = {};

        if (command.bio !== undefined) {
            const trimmed = command.bio.trim();
            if (trimmed.length > BIO_MAX_LENGTH) {
                throw new BadRequestException(`한 줄 소개는 ${BIO_MAX_LENGTH}자 이내여야 합니다.`);
            }
            sanitized.bio = trimmed;
        }

        if (command.location !== undefined) {
            if (role !== 'breeder') {
                // 입양자 schema 에 사업장 위치 필드가 없다 — 명시적으로 거부.
                throw new BadRequestException('사업장 위치는 브리더 계정에서만 편집할 수 있습니다.');
            }
            sanitized.location = this.sanitizeLocation(command.location);
        }

        return sanitized;
    }

    private sanitizeLocation(location: UpdateMyProfileLocation): UpdateMyProfileLocation {
        const result: UpdateMyProfileLocation = {};
        if (location.city !== undefined) {
            const trimmed = location.city.trim();
            if (trimmed.length > LOCATION_CITY_MAX) {
                throw new BadRequestException(`시는 ${LOCATION_CITY_MAX}자 이내여야 합니다.`);
            }
            result.city = trimmed;
        }
        if (location.district !== undefined) {
            const trimmed = location.district.trim();
            if (trimmed.length > LOCATION_DISTRICT_MAX) {
                throw new BadRequestException(`구는 ${LOCATION_DISTRICT_MAX}자 이내여야 합니다.`);
            }
            result.district = trimmed;
        }
        if (location.address !== undefined) {
            const trimmed = location.address.trim();
            if (trimmed.length > LOCATION_ADDRESS_MAX) {
                throw new BadRequestException(`상세 주소는 ${LOCATION_ADDRESS_MAX}자 이내여야 합니다.`);
            }
            result.address = trimmed;
        }
        return result;
    }
}

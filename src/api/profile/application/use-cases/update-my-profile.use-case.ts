import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { GetMyProfileUseCase } from './get-my-profile.use-case';
import type { MyProfileResponseDto } from '../../dto/response/my-profile-response.dto';
import {
    PROFILE_WRITER_PORT,
    type ProfileUpdatableRole,
    type ProfileWriterPort,
    type UpdateMyProfileCommand,
} from '../ports/profile-writer.port';

const BIO_MAX_LENGTH = 200;

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
        const sanitized = this.sanitize(command);

        const updated = await this.writer.updateMyProfile(userId, role, sanitized);
        if (!updated) {
            throw new BadRequestException('프로필 정보를 찾을 수 없습니다.');
        }

        return this.getMyProfileUseCase.execute(userId, role);
    }

    private sanitize(command: UpdateMyProfileCommand): UpdateMyProfileCommand {
        const sanitized: UpdateMyProfileCommand = {};
        if (command.bio !== undefined) {
            const trimmed = command.bio.trim();
            if (trimmed.length > BIO_MAX_LENGTH) {
                throw new BadRequestException(`한 줄 소개는 ${BIO_MAX_LENGTH}자 이내여야 합니다.`);
            }
            sanitized.bio = trimmed;
        }
        return sanitized;
    }
}

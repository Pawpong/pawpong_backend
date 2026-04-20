import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';

@Injectable()
export class AuthProfileImageFilePolicyService {
    validate(file: Express.Multer.File): void {
        if (file.size > 100 * 1024 * 1024) {
            throw new DomainValidationError('파일 크기는 100MB를 초과할 수 없습니다.');
        }
    }
}

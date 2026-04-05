import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthProfileImageFilePolicyService {
    validate(file: Express.Multer.File): void {
        if (file.size > 100 * 1024 * 1024) {
            throw new BadRequestException('파일 크기는 100MB를 초과할 수 없습니다.');
        }
    }
}

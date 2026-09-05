import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';

@Injectable()
export class AuthBreederDocumentFilePolicyService {
    validate(files: Express.Multer.File[], types: string[]): void {
        if (!files || files.length === 0) {
            throw new DomainValidationError('파일이 업로드되지 않았습니다.');
        }

        // 현재 심사는 단일 입점 검증 정책이다. 추가 서류는 구버전 업로드와
        // 관리자 참고 자료 호환을 위해 허용하되 등급 판정에는 사용하지 않는다.
        const validTypes: readonly string[] = [
            'idCard',
            'animalProductionLicense',
            'adoptionContractSample',
            'recentAssociationDocument',
            'breederCertification',
            'ticaCfaDocument',
        ];
        for (const type of types) {
            if (!validTypes.includes(type)) {
                throw new DomainValidationError(
                    `유효하지 않은 서류 타입입니다: ${type}. 허용된 타입: ${validTypes.join(', ')}`,
                );
            }
        }

        if (new Set(types).size !== types.length) {
            throw new DomainValidationError('중복된 서류 타입이 있습니다. 각 서류는 한 번만 업로드해야 합니다.');
        }

        if (files.length !== types.length) {
            throw new DomainValidationError(
                `파일 개수(${files.length})와 서류 타입 개수(${types.length})가 일치하지 않습니다.`,
            );
        }

        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/gif',
            'image/bmp',
            'image/tiff',
            'application/haansofthwp',
            'application/x-hwp',
            'application/vnd.hancom.hwp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        const allowedExtensions = [
            'pdf',
            'jpg',
            'jpeg',
            'png',
            'webp',
            'heic',
            'heif',
            'gif',
            'bmp',
            'tiff',
            'hwp',
            'doc',
            'docx',
            'xls',
            'xlsx',
        ];

        for (const file of files) {
            if (file.size > 100 * 1024 * 1024) {
                throw new DomainValidationError(`파일 "${file.originalname}"의 크기는 100MB를 초과할 수 없습니다.`);
            }

            const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
            if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(extension)) {
                throw new DomainValidationError(
                    `파일 "${file.originalname}"은(는) 지원되지 않는 형식입니다. (지원: pdf, jpg, jpeg, png, webp, heic, gif, hwp, doc, docx, xls, xlsx)`,
                );
            }
        }
    }
}

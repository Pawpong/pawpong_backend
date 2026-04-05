import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthBreederDocumentFilePolicyService {
    validate(files: Express.Multer.File[], types: string[], level: 'new' | 'elite'): void {
        if (!files || files.length === 0) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        const allowedTypes = {
            new: ['idCard', 'animalProductionLicense'],
            elite: [
                'idCard',
                'animalProductionLicense',
                'adoptionContractSample',
                'recentAssociationDocument',
                'breederCertification',
                'ticaCfaDocument',
            ],
        } as const;

        if (!['new', 'elite'].includes(level)) {
            throw new BadRequestException('레벨은 "new" 또는 "elite"만 가능합니다.');
        }

        const validTypes = allowedTypes[level] as readonly string[];
        for (const type of types) {
            if (!validTypes.includes(type as (typeof validTypes)[number])) {
                throw new BadRequestException(
                    `${level} 레벨에서 유효하지 않은 서류 타입입니다: ${type}. 허용된 타입: ${validTypes.join(', ')}`,
                );
            }
        }

        if (new Set(types).size !== types.length) {
            throw new BadRequestException('중복된 서류 타입이 있습니다. 각 서류는 한 번만 업로드해야 합니다.');
        }

        if (files.length !== types.length) {
            throw new BadRequestException(
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
                throw new BadRequestException(`파일 "${file.originalname}"의 크기는 100MB를 초과할 수 없습니다.`);
            }

            const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
            if (!allowedMimeTypes.includes(file.mimetype) && !allowedExtensions.includes(extension)) {
                throw new BadRequestException(
                    `파일 "${file.originalname}"은(는) 지원되지 않는 형식입니다. (지원: pdf, jpg, jpeg, png, webp, heic, gif, hwp, doc, docx, xls, xlsx)`,
                );
            }
        }
    }
}

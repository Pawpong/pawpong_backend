import { Injectable } from '@nestjs/common';

import type {
    BreederPetPostingDraftForm,
    BreederPetPostingDraftPhotoUrls,
} from '../../application/types/breeder-pet-posting-draft.type';

/**
 * 임시저장 form 의 파일키를 표시용 URL 로 옮긴다.
 *
 * form 은 작성 중 payload 라 어떤 필드도 없거나 타입이 어긋날 수 있다(Record<string, unknown>).
 * 따라서 모든 접근을 방어적으로 다루고, 확실히 문자열인 키만 변환한다.
 */
@Injectable()
export class BreederPetPostingDraftPhotoUrlService {
    toPhotoUrls(form: BreederPetPostingDraftForm, toUrl: (fileName: string) => string): BreederPetPostingDraftPhotoUrls {
        return {
            pet: this.asFileNames(form.photos).map(toUrl),
            parents: this.asRecords(form.parentPetSnapshots).map((parent) => {
                const fileName = this.asFileName(parent.photoFileName);
                return fileName ? toUrl(fileName) : null;
            }),
            breedingEnvironment: this.resolveBreedingEnvironmentUrl(form.breedingEnvironment, toUrl),
        };
    }

    private resolveBreedingEnvironmentUrl(
        value: unknown,
        toUrl: (fileName: string) => string,
    ): string | null {
        if (!this.isRecord(value)) {
            return null;
        }
        const fileName = this.asFileName(value.photoFileName);
        return fileName ? toUrl(fileName) : null;
    }

    /** 문자열 파일키만 남긴다 — 빈 값이 섞이면 사진 순서가 어긋나므로 걸러낸다 */
    private asFileNames(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.flatMap((item) => {
            const fileName = this.asFileName(item);
            return fileName ? [fileName] : [];
        });
    }

    private asRecords(value: unknown): Record<string, unknown>[] {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item): item is Record<string, unknown> => this.isRecord(item));
    }

    private asFileName(value: unknown): string | null {
        return typeof value === 'string' && value.trim().length > 0 ? value : null;
    }

    private isRecord(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null;
    }
}

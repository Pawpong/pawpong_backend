import { Injectable } from '@nestjs/common';
import { StorageService } from '../../../../common/storage/storage.service';
import type { AccountDeletionFiles } from '../application/ports/account-deletion.port';

@Injectable()
export class AccountDeletionFilesAdapter implements AccountDeletionFiles {
    constructor(private readonly storage: StorageService) {}
    resolveKey(value: string): string | null {
        const input = value.trim();
        if (/^https?:\/\//i.test(input)) {
            try {
                const url = new URL(input);
                const base = new URL(this.storage.getCdnUrl(''));
                if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
            } catch {
                return null;
            }
        } else if (input.includes('://') || input.startsWith('//')) return null;
        const key = this.storage.toFileKey(input);
        if (!key.includes('/') && !/^[a-f\d]{8}-[a-f\d-]{27}\.[a-z\d]+$/i.test(key)) return null;
        if (
            !key ||
            Array.from(key).some((character) => character.charCodeAt(0) < 32) ||
            /[\\?#]/.test(key) ||
            key.split('/').some((part) => !part || part === '..' || part === '.')
        )
            return null;
        // 공통 로고/기본 이미지/운영 배너는 사용자가 업로드한 파일로 취급하지 않는다.
        if (
            /^(?:images|assets|defaults?|banners|auth-banners|counsel-banners|filters|ai-image\/(?:filter|reference))\//i.test(
                key,
            )
        )
            return null;
        return key;
    }
    async listPrefix(prefix: string): Promise<string[]> {
        if (!/^videos\/hls\/[a-f\d]{24}\/$/.test(prefix)) throw new Error('INVALID_DELETION_PREFIX');
        const result: string[] = [];
        let token: string | undefined;
        do {
            const page = await this.storage.listObjects(prefix, 1000, token);
            for (const object of page.Contents ?? []) if (object.Key?.startsWith(prefix)) result.push(object.Key);
            const next = page.IsTruncated ? page.NextContinuationToken : undefined;
            if (page.IsTruncated && (!next || next === token)) throw new Error('INCOMPLETE_FILE_LIST');
            token = next;
        } while (token);
        return result;
    }
    async delete(objectKey: string) {
        await this.storage.deleteFile(objectKey);
    }
}

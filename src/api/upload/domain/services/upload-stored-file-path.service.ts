import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadStoredFilePathService {
    private static readonly legacyBucketNames = ['pawpong_bucket', 'pawpong_s3'];

    extractStoredPaths(urls: string[], activeBucketName: string): string[] {
        return urls.map((url) => this.extractStoredPath(url, activeBucketName)).filter(Boolean);
    }

    extractStoredPath(url: string, activeBucketName: string): string {
        if (!url) {
            return '';
        }

        if (!url.startsWith('http')) {
            return this.stripBucketPrefix(url, activeBucketName);
        }

        try {
            const urlObject = new URL(url);
            let filePath = urlObject.pathname.startsWith('/') ? urlObject.pathname.slice(1) : urlObject.pathname;

            if (urlObject.hostname.includes('object.iwinv.kr')) {
                filePath = this.stripBucketPrefix(filePath, activeBucketName);
            }

            return filePath || '';
        } catch {
            return url;
        }
    }

    private stripBucketPrefix(filePath: string, activeBucketName: string): string {
        const bucketNames = new Set([activeBucketName, ...UploadStoredFilePathService.legacyBucketNames].filter(Boolean));

        for (const bucketName of bucketNames) {
            if (filePath.startsWith(`${bucketName}/`)) {
                return filePath.slice(`${bucketName}/`.length);
            }
        }

        return filePath;
    }
}

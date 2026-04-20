import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { RedisService } from '../../../../common/redis/redis.module';
import { FeedVideoStreamPort } from '../application/ports/feed-video-stream.port';

@Injectable()
export class FeedVideoStorageStreamAdapter implements FeedVideoStreamPort {
    constructor(
        private readonly storageService: StorageService,
        private readonly redisService: RedisService,
    ) {}

    async readFile(fileKey: string): Promise<Buffer> {
        const fileStream = await this.storageService.getFileStream(fileKey);
        const chunks: Buffer[] = [];

        for await (const chunk of fileStream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }

    getTextCache(cacheKey: string): Promise<string | null> {
        return this.redisService.get(cacheKey);
    }

    setTextCache(cacheKey: string, value: string, ttlSeconds: number): Promise<void> {
        return this.redisService.set(cacheKey, value, ttlSeconds);
    }

    async getBinaryCache(cacheKey: string): Promise<Buffer | null> {
        const cachedValue = await this.redisService.get(cacheKey);
        return cachedValue ? Buffer.from(cachedValue, 'base64') : null;
    }

    setBinaryCache(cacheKey: string, value: Buffer, ttlSeconds: number): Promise<void> {
        return this.redisService.set(cacheKey, value.toString('base64'), ttlSeconds);
    }

    hasCache(cacheKey: string): Promise<boolean> {
        return this.redisService.exists(cacheKey);
    }
}

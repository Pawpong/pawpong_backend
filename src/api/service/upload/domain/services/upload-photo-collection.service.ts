import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadPhotoCollectionService {
    resolveExistingPhotoPaths(requestPhotoPaths: string[], persistedPhotoPaths: string[]): string[] {
        return requestPhotoPaths.length > 0 ? requestPhotoPaths : persistedPhotoPaths;
    }

    mergePhotoPaths(existingPhotoPaths: string[], uploadedPhotoPaths: string[]): string[] {
        return [...existingPhotoPaths, ...uploadedPhotoPaths];
    }
}

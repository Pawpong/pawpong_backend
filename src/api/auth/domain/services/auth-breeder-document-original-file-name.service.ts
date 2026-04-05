import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthBreederDocumentOriginalFileNameService {
    resolve(originalFileName: string): string {
        try {
            if (originalFileName && /[^\x00-\x7F]/.test(originalFileName)) {
                return originalFileName;
            }

            if (!originalFileName) {
                return originalFileName;
            }

            const decoded = Buffer.from(originalFileName, 'latin1').toString('utf8');
            return decoded !== originalFileName ? decoded : originalFileName;
        } catch {
            return originalFileName;
        }
    }
}

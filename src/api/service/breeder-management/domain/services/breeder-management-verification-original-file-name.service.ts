import { Injectable } from '@nestjs/common';

@Injectable()
export class BreederManagementVerificationOriginalFileNameService {
    resolve(originalFileName: string): string {
        if (!originalFileName) {
            return originalFileName;
        }

        try {
            if (/[^\x00-\x7F]/.test(originalFileName)) {
                return originalFileName;
            }

            const decoded = Buffer.from(originalFileName, 'latin1').toString('utf8');
            return decoded !== originalFileName ? decoded : originalFileName;
        } catch {
            return originalFileName;
        }
    }
}

import { Injectable } from '@nestjs/common';
import {
    AdopterAdminDeletedReviewSnapshot,
    AdopterAdminWriterPort,
    AdopterAdminActivityLogEntry,
} from '../application/ports/adopter-admin-writer.port';
import { AdopterAdminRepository } from '../repository/adopter-admin.repository';

@Injectable()
export class AdopterAdminWriterAdapter implements AdopterAdminWriterPort {
    constructor(private readonly adopterAdminRepository: AdopterAdminRepository) {}

    async hideReview(breederId: string, reviewId: string): Promise<AdopterAdminDeletedReviewSnapshot | null> {
        const review = await this.adopterAdminRepository.hideReview(breederId, reviewId);
        if (!review) {
            return null;
        }

        const breeder = await this.adopterAdminRepository.findBreederById(breederId);

        return {
            reviewId: review._id.toString(),
            breederId,
            breederName: breeder?.name || 'Unknown',
        };
    }

    async appendAdminActivity(adminId: string, logEntry: AdopterAdminActivityLogEntry): Promise<void> {
        await this.adopterAdminRepository.appendAdminActivity(adminId, logEntry);
    }
}

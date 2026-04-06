import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Admin, AdminDocument } from '../../../../schema/admin.schema';
import { Breeder, BreederDocument } from '../../../../schema/breeder.schema';
import { BreederReview, BreederReviewDocument } from '../../../../schema/breeder-review.schema';
import {
    AdopterAdminDeletedReviewSnapshot,
    AdopterAdminWriterPort,
    AdopterAdminActivityLogEntry,
} from '../application/ports/adopter-admin-writer.port';

@Injectable()
export class AdopterAdminWriterAdapter implements AdopterAdminWriterPort {
    constructor(
        @InjectModel(Admin.name)
        private readonly adminModel: Model<AdminDocument>,
        @InjectModel(Breeder.name)
        private readonly breederModel: Model<BreederDocument>,
        @InjectModel(BreederReview.name)
        private readonly breederReviewModel: Model<BreederReviewDocument>,
    ) {}

    async hideReview(breederId: string, reviewId: string): Promise<AdopterAdminDeletedReviewSnapshot | null> {
        const review = await this.breederReviewModel.findOne({
            _id: reviewId,
            breederId,
        });

        if (!review) {
            return null;
        }

        review.isVisible = false;
        await review.save();

        const breeder = await this.breederModel.findById(breederId).select('name').lean().exec();

        return {
            reviewId: review._id.toString(),
            breederId,
            breederName: breeder?.name || 'Unknown',
        };
    }

    async appendAdminActivity(adminId: string, logEntry: AdopterAdminActivityLogEntry): Promise<void> {
        const admin = await this.adminModel.findById(adminId);

        if (!admin) {
            return;
        }

        admin.activityLogs.push(logEntry as any);
        await admin.save();
    }
}

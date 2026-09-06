import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SupportEventRecord } from '../../../../schema/support-event.schema';
import type { SupportEvent } from '../application/ports/support-log.port';

@Injectable()
export class SupportEventRepository {
    constructor(@InjectModel(SupportEventRecord.name) private readonly model: Model<SupportEventRecord>) {}

    async insert(event: SupportEvent, environment: string): Promise<void> {
        await this.model.create({ ...event, environment });
    }

    claim(environment: string, leaseToken: string) {
        return this.model
            .findOneAndUpdate(
                { deliveryStatus: 'pending', environment, nextAttemptAt: { $lte: new Date() } },
                { $set: { leaseToken, nextAttemptAt: new Date(Date.now() + 60_000) }, $inc: { attempts: 1 } },
                { new: true, sort: { nextAttemptAt: 1 } },
            )
            .lean()
            .exec();
    }

    async delivered(eventId: string, leaseToken: string): Promise<void> {
        await this.model
            .updateOne(
                { eventId, leaseToken },
                {
                    $set: { deliveryStatus: 'delivered', deliveredAt: new Date() },
                    $unset: { leaseToken: 1 },
                },
            )
            .exec();
    }

    async retry(eventId: string, leaseToken: string, attempts: number): Promise<void> {
        const delay = Math.min(3_600_000, 15_000 * 2 ** Math.min(attempts, 8));
        await this.model
            .updateOne(
                { eventId, leaseToken },
                {
                    $set: { nextAttemptAt: new Date(Date.now() + delay) },
                    $unset: { leaseToken: 1 },
                },
            )
            .exec();
    }
}

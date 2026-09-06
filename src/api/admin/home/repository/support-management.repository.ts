import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { SupportEventRecord } from '../../../../schema/support-event.schema';
import type { SupportManagementPort, SupportStatus, SupportUpdate } from '../application/ports/support-management.port';

/** 관리자 작업 이력과 다음 Discord 알림을 한 문서에서 원자적으로 갱신한다. */
@Injectable()
export class SupportManagementRepository implements SupportManagementPort {
    constructor(@InjectModel(SupportEventRecord.name) private readonly model: Model<SupportEventRecord>) {}

    /** 현재 환경의 접수를 최근 순으로 조회한다. */
    async list(environment: string, page: number, status?: SupportStatus, receiptId?: string) {
        const filter = { environment, ...(receiptId ? { eventId: receiptId } : {}), ...(status ? { status } : {}) };
        const [items, total] = await Promise.all([
            this.model
                .find(filter)
                .select('-leaseToken -__v')
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * 20)
                .limit(20)
                .lean()
                .exec(),
            this.model.countDocuments(filter).exec(),
        ]);
        return { items, total, page, pageSize: 20 };
    }

    /** revision을 비교하여 동시 수정 유실을 막고 변경자 이력을 남긴다. */
    async update(environment: string, eventId: string, actorId: string, command: SupportUpdate) {
        const current = await this.model.findOne({ eventId, environment, revision: command.revision }).lean().exec();
        if (!current) return null;
        const assigneeId =
            command.assignment === 'me' ? actorId : command.assignment === 'unassigned' ? '' : current.assigneeId;
        return this.model
            .findOneAndUpdate(
                { eventId, environment, revision: command.revision },
                {
                    $set: {
                        status: command.status,
                        assigneeId,
                        deliveryStatus: 'pending',
                        nextAttemptAt: new Date(),
                        attempts: 0,
                    },
                    $inc: { revision: 1 },
                    $unset: { leaseToken: 1 },
                    $push: {
                        history: {
                            actorId,
                            assigneeId,
                            status: command.status,
                            note: command.note || '',
                            at: new Date(),
                        },
                    },
                },
                { new: true },
            )
            .select('-leaseToken -__v')
            .lean()
            .exec();
    }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'support_events', timestamps: true })
export class SupportEventRecord {
    @Prop({ required: true, unique: true }) eventId: string;
    @Prop({ required: true, enum: ['feedback', 'ai_no_match', 'ai_error'] }) kind: string;
    @Prop({ required: true }) userType: string;
    @Prop() message?: string;
    @Prop() durationMs?: number;
    @Prop({ type: [String], default: [] }) sourceIds: string[];
    @Prop({ required: true }) environment: string;
    @Prop({ default: 'pending', enum: ['pending', 'delivered'] }) deliveryStatus: string;
    @Prop({ default: 0 }) attempts: number;
    @Prop({ default: () => new Date() }) nextAttemptAt: Date;
    @Prop() leaseToken?: string;
    @Prop() deliveredAt?: Date;
    @Prop({ default: 'open', enum: ['open', 'in_progress', 'resolved'] }) status: string;
    @Prop({ default: '' }) assigneeId: string;
    @Prop({ default: 0 }) revision: number;
    @Prop({ type: [{ actorId: String, status: String, assigneeId: String, note: String, at: Date }], default: [] })
    history: Array<{ actorId: string; status: string; assigneeId: string; note: string; at: Date }>;
    createdAt: Date;
    updatedAt: Date;
}
export type SupportEventDocument = HydratedDocument<SupportEventRecord>;
export const SupportEventSchema = SchemaFactory.createForClass(SupportEventRecord);
SupportEventSchema.index({ deliveryStatus: 1, environment: 1, nextAttemptAt: 1 });

SupportEventSchema.index({ environment: 1, status: 1, createdAt: -1 });

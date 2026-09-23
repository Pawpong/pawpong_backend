import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** 관리자가 발행한 공유 링크의 공개 메타데이터와 앱 내 목적지를 보관한다. */
@Schema({ collection: 'deep_links', timestamps: true })
export class DeepLink {
    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ required: true })
    title: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ required: true })
    targetPath: string;

    @Prop({ default: '' })
    imageUrl: string;

    @Prop({ default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export type DeepLinkDocument = HydratedDocument<DeepLink>;
export const DeepLinkSchema = SchemaFactory.createForClass(DeepLink);

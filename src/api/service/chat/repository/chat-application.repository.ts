import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import type { ChatApplicationReaderPort } from '../application/ports/chat-application-reader.port';

@Injectable()
export class ChatApplicationRepository implements ChatApplicationReaderPort {
    constructor(
        @InjectModel(AdoptionApplication.name) private readonly applications: Model<AdoptionApplicationDocument>,
    ) {}

    /** 계정 유형이 아닌 신청서의 신청인·수신인으로 권한을 확인한다. */
    async belongsToParticipants(applicationId: string, participantIds: string[]): Promise<boolean> {
        if (!isValidObjectId(applicationId) || participantIds.length !== 2 || participantIds[0] === participantIds[1])
            return false;
        const application = await this.applications.findById(applicationId).select('adopterId breederId').lean().exec();
        if (!application?.adopterId || !application?.breederId) return false;
        const owners = [String(application.adopterId), String(application.breederId)];
        return owners[0] !== owners[1] && participantIds.every((id) => owners.includes(id));
    }
}

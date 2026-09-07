import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AdoptionApplication, AdoptionApplicationDocument } from '../../../../schema/adoption-application.schema';
import type {
    ChatApplicationReaderPort,
    ChatApplicationListReaderPort,
    ChatApplicationResult,
} from '../application/ports/chat-application-reader.port';

@Injectable()
export class ChatApplicationRepository implements ChatApplicationReaderPort, ChatApplicationListReaderPort {
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

    /** 기존 방의 잘못된 연결도 재검증하고 내부 메모/연락처는 응답하지 않는다. */
    async readLinked(
        applicationIds: string[],
        participantIds: string[],
        userId: string,
    ): Promise<ChatApplicationResult[]> {
        const ids = [...new Set(applicationIds)].filter(isValidObjectId);
        if (!ids.length || participantIds.length !== 2 || !participantIds.includes(userId)) return [];
        const [a, b] = participantIds;
        if (a === b) return [];
        const applications = await this.applications
            .find({
                _id: { $in: ids },
                $or: [
                    { adopterId: a, breederId: b },
                    { adopterId: b, breederId: a },
                ],
            })
            .select('adopterId petId petName status appliedAt standardResponses customResponses')
            .sort({ appliedAt: -1, _id: -1 })
            .lean()
            .exec();
        return applications.map((application) => ({
            applicationId: String(application._id),
            direction: String(application.adopterId) === userId ? 'sent' : 'received',
            petName: application.petName,
            petId: application.petId ? String(application.petId) : undefined,
            status: application.status,
            appliedAt: application.appliedAt?.toISOString(),
            standardResponses: { ...application.standardResponses },
            customResponses: (application.customResponses ?? []).map(
                ({ questionId, questionLabel, questionType, answer }) => ({
                    questionId,
                    questionLabel,
                    questionType,
                    answer,
                }),
            ),
        }));
    }
}

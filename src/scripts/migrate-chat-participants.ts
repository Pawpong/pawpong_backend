import mongoose from 'mongoose';

import { SenderRole } from '../schema/chat-message.schema';
import { ChatRoomStatus } from '../schema/chat-room.schema';
import { buildChatParticipantKey } from '../api/service/chat/domain/chat-participant-key';

type Participant = { userId: string; role: SenderRole };
type ParticipantState = {
    userId: string;
    lastReadMessageId?: string;
    lastReadAt?: Date;
    hiddenAt?: Date;
};
type RoomRecord = {
    _id: mongoose.Types.ObjectId;
    participantIds?: string[];
    participants?: Participant[];
    participantKey?: string;
    participantStates?: ParticipantState[];
    applicationIds?: string[];
    adopterId?: string;
    breederId?: string;
    applicationId?: string;
    lastReadMessageId?: { adopter?: string; breeder?: string };
    status?: ChatRoomStatus;
    lastMessage?: string;
    lastMessageAt?: Date;
    createdAt?: Date;
};

export type ChatParticipantMigrationSummary = {
    dryRun: boolean;
    scannedRooms: number;
    migratedRooms: number;
    mergedRooms: number;
    movedMessages: number;
    skippedRoomIds: string[];
};

function participantsOf(room: RoomRecord): Participant[] {
    if (room.participants?.length === 2) return room.participants;
    return [
        room.adopterId ? { userId: room.adopterId, role: SenderRole.ADOPTER } : undefined,
        room.breederId ? { userId: room.breederId, role: SenderRole.BREEDER } : undefined,
    ].filter((participant): participant is Participant => Boolean(participant));
}

function applicationsOf(room: RoomRecord): string[] {
    return [...new Set([...(room.applicationIds ?? []), room.applicationId].filter(Boolean))] as string[];
}

function statesOf(room: RoomRecord, participants: Participant[]): ParticipantState[] {
    if (room.participantStates?.length) return room.participantStates;
    return participants.map(({ userId, role }) => ({
        userId,
        lastReadMessageId:
            role === SenderRole.ADOPTER ? room.lastReadMessageId?.adopter : room.lastReadMessageId?.breeder,
    }));
}

function canonicalRoom(rooms: RoomRecord[]): RoomRecord {
    return [...rooms].sort((left, right) => {
        const activeDiff =
            Number(right.status === ChatRoomStatus.ACTIVE) - Number(left.status === ChatRoomStatus.ACTIVE);
        if (activeDiff !== 0) return activeDiff;
        return (right.createdAt?.getTime() ?? 0) - (left.createdAt?.getTime() ?? 0);
    })[0];
}

async function latestReadState(
    messages: any,
    rooms: RoomRecord[],
    participant: Participant,
): Promise<ParticipantState> {
    const states = rooms
        .flatMap((room) => statesOf(room, participantsOf(room)))
        .filter((state) => state.userId === participant.userId);
    const hiddenAt = states
        .map((state) => state.hiddenAt)
        .filter((value): value is Date => value instanceof Date)
        .sort((left, right) => right.getTime() - left.getTime())
        .at(0);
    const candidates = states.filter((state) => state.lastReadMessageId);
    if (candidates.length === 0) return { userId: participant.userId, ...(hiddenAt ? { hiddenAt } : {}) };

    const messageIds = candidates
        .map(({ lastReadMessageId }) => lastReadMessageId)
        .filter((id): id is string => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id));
    if (messageIds.length === 0) {
        return { ...candidates.at(-1)!, userId: participant.userId, ...(hiddenAt ? { hiddenAt } : {}) };
    }
    const latest = await messages
        .find({ _id: { $in: messageIds.map((id) => new mongoose.Types.ObjectId(id)) } })
        .sort({ createdAt: -1 })
        .limit(1)
        .next()
        .catch(() => null);
    const selected =
        candidates.find(({ lastReadMessageId }) => lastReadMessageId === latest?._id?.toString()) ?? candidates.at(-1)!;
    return { ...selected, userId: participant.userId, ...(hiddenAt ? { hiddenAt } : {}) };
}

export async function migrateChatParticipants(
    db: mongoose.mongo.Db,
    isDryRun = false,
): Promise<ChatParticipantMigrationSummary> {
    const rooms = db.collection<RoomRecord>('chat_rooms');
    const messages = db.collection('chat_messages');
    const allRooms = await rooms.find({}).sort({ createdAt: 1 }).toArray();
    const grouped = new Map<string, RoomRecord[]>();
    const skippedRoomIds: string[] = [];

    for (const room of allRooms) {
        const participantIds = participantsOf(room).map(({ userId }) => userId);
        if (participantIds.length !== 2 || participantIds[0] === participantIds[1]) {
            skippedRoomIds.push(room._id.toString());
            continue;
        }
        const key = buildChatParticipantKey(participantIds);
        grouped.set(key, [...(grouped.get(key) ?? []), room]);
    }

    if (!isDryRun && skippedRoomIds.length > 0) {
        throw new Error(
            `참여자를 확정할 수 없는 채팅방이 있어 마이그레이션을 중단합니다: ${skippedRoomIds.join(', ')}`,
        );
    }

    let migratedRooms = 0;
    let mergedRooms = 0;
    let movedMessages = 0;

    for (const [participantKey, group] of grouped) {
        const canonical = canonicalRoom(group);
        const participants = participantsOf(canonical);
        const participantIds = participants.map(({ userId }) => userId);
        const participantStates = await Promise.all(
            participants.map((participant) => latestReadState(messages, group, participant)),
        );
        const allClosed = group.every(({ status }) => status === ChatRoomStatus.CLOSED);
        if (allClosed) {
            const hiddenAt = canonical.createdAt ?? new Date();
            participantStates.forEach((state) => {
                state.hiddenAt = hiddenAt;
            });
        }

        const latestMessageRoom = [...group].sort(
            (left, right) => (right.lastMessageAt?.getTime() ?? 0) - (left.lastMessageAt?.getTime() ?? 0),
        )[0];
        const applicationIds = [...new Set(group.flatMap(applicationsOf))];
        const duplicateIds = group.filter(({ _id }) => !_id.equals(canonical._id)).map(({ _id }) => _id);

        if (!isDryRun) {
            if (duplicateIds.length) {
                const duplicateRoomIds = duplicateIds.map((id) => id.toString());
                const moved = await messages.updateMany(
                    { roomId: { $in: duplicateRoomIds } },
                    { $set: { roomId: canonical._id.toString() } },
                );
                movedMessages += moved.modifiedCount;
                await rooms.deleteMany({ _id: { $in: duplicateIds } });
            }

            await rooms.updateOne(
                { _id: canonical._id },
                {
                    $set: {
                        participantIds,
                        participants,
                        participantKey,
                        participantStates,
                        applicationIds,
                        status: ChatRoomStatus.ACTIVE,
                        lastMessage: latestMessageRoom.lastMessage,
                        lastMessageAt: latestMessageRoom.lastMessageAt,
                    },
                },
            );
        }

        migratedRooms += 1;
        mergedRooms += duplicateIds.length;
    }

    if (!isDryRun) {
        const indexes = await rooms.indexes();
        for (const index of indexes) {
            const keys = Object.keys(index.key);
            if (keys.includes('adopterId') && keys.includes('breederId')) await rooms.dropIndex(index.name!);
        }
        await rooms.createIndex(
            { participantKey: 1 },
            {
                name: 'uniq_chat_room_participant_key',
                unique: true,
                partialFilterExpression: { participantKey: { $type: 'string' } },
            },
        );
        await rooms.createIndex({ participantIds: 1, lastMessageAt: -1 });
    }

    return {
        dryRun: isDryRun,
        scannedRooms: allRooms.length,
        migratedRooms,
        mergedRooms,
        movedMessages,
        skippedRoomIds,
    };
}

async function runCli(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI가 필요합니다.');
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB 연결에 실패했습니다.');
    const summary = await migrateChatParticipants(db, process.argv.includes('--dry-run'));
    console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
    runCli()
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        })
        .finally(async () => {
            await mongoose.disconnect();
        });
}

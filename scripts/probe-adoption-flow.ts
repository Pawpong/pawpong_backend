/**
 * 입양 플로우 전체 시나리오 probe.
 *
 * 신청 → 확정 → (펫 분양완료 전이 / approvedAt·adoptedAt 기록 / 다른 대기 신청 자동 거절 /
 * 목록에서 제외 / 상세는 조회됨 / 재신청 차단 / 채팅방 생성·멱등) 까지 실제 HTTP 로 태운다.
 *
 * 실행: node --env-file=.env -r ts-node/register scripts/probe-adoption-flow.ts
 * 픽스처는 __probe 마커를 달아 만들고 종료 시 반드시 지운다.
 */
import { JwtService } from '@nestjs/jwt';
import { createConnection, Types } from 'mongoose';

const MARKER = `__probe_adoption_${Date.now()}`;

const results: Array<{ ok: boolean; label: string; detail?: string }> = [];

function check(label: string, ok: boolean, detail?: string): void {
    results.push({ ok, label, detail });
    console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
}

type Json = Record<string, any>;

async function api(
    baseUrl: string,
    method: string,
    path: string,
    options: { token?: string; body?: Json } = {},
): Promise<{ status: number; body: Json }> {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    const text = await response.text();
    let body: Json = {};
    try {
        body = text ? JSON.parse(text) : {};
    } catch {
        body = { raw: text };
    }
    return { status: response.status, body };
}

const applicationBody = (petId: string) => ({
    petId,
    adoptionPlan: '재택근무라 하루 종일 함께 있을 수 있습니다. 마당 있는 단독주택입니다.',
    familyMembers: '배우자 1명',
    privacyConsent: true,
    basicCareConsent: true,
    emergencyCareConsent: true,
    allFamilyConsent: true,
});

async function main(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    const jwtSecret = process.env.JWT_SECRET;
    const baseUrl = `http://localhost:${process.env.PORT ?? '8080'}/api`;
    if (!mongoUri || !jwtSecret) throw new Error('MONGODB_URI와 JWT_SECRET이 필요합니다.');

    const connection = createConnection(mongoUri);
    await connection.asPromise();

    const breeders = connection.collection('breeders');
    const adopters = connection.collection('adopters');
    const pets = connection.collection('available_pets');
    const applications = connection.collection('adoption_applications');
    const chatRooms = connection.collection('chat_rooms');

    const breederId = new Types.ObjectId();
    const adopterOneId = new Types.ObjectId();
    const adopterTwoId = new Types.ObjectId();
    const petId = new Types.ObjectId();

    const jwt = new JwtService({ secret: jwtSecret });
    const sign = (id: Types.ObjectId, role: string) =>
        jwt.sign({ sub: id.toString(), email: `${MARKER}_${role}@local`, role }, { expiresIn: '10m' });
    const breederToken = sign(breederId, 'breeder');
    const adopterOneToken = sign(adopterOneId, 'adopter');
    const adopterTwoToken = sign(adopterTwoId, 'adopter');

    try {
        // ---- 픽스처 (스키마 검증 우회를 위해 네이티브 드라이버로 직접 삽입) ----
        await breeders.insertOne({
            _id: breederId,
            name: `${MARKER}_브리더`,
            nickname: `${MARKER}_브리더`,
            emailAddress: `${MARKER}_breeder@local`,
            accountStatus: 'active',
            completedAdoptions: 0,
            createdAt: new Date(),
        } as never);
        await adopters.insertMany([
            {
                _id: adopterOneId,
                realName: `${MARKER}_입양자1`,
                nickname: `${MARKER}_입양자1`,
                emailAddress: `${MARKER}_adopter1@local`,
                phoneNumber: '010-0000-0001',
                accountStatus: 'active',
                createdAt: new Date(),
            },
            {
                _id: adopterTwoId,
                realName: `${MARKER}_입양자2`,
                nickname: `${MARKER}_입양자2`,
                emailAddress: `${MARKER}_adopter2@local`,
                phoneNumber: '010-0000-0002',
                accountStatus: 'active',
                createdAt: new Date(),
            },
        ] as never);
        await pets.insertOne({
            _id: petId,
            breederId,
            name: `${MARKER}_펫`,
            breed: '말티즈',
            petType: 'dog',
            gender: 'female',
            birthDate: new Date('2025-01-01'),
            price: 1000000,
            status: 'available',
            isActive: true,
            photos: [],
            inquiryCount: 0,
            favoriteCount: 0,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as never);

        // ---- 1. 신청 2건 (서로 다른 입양자) ----
        const first = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterOneToken,
            body: applicationBody(petId.toString()),
        });
        check('입양자1 신청 접수', first.status === 200, `status=${first.status}`);
        const applicationId = first.body?.data?.applicationId as string;

        const second = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterTwoToken,
            body: applicationBody(petId.toString()),
        });
        check('입양자2 신청 접수 (확정 시 자동 거절 대상)', second.status === 200, `status=${second.status}`);
        const otherApplicationId = second.body?.data?.applicationId as string;

        // ---- 2. 확정 전 목록 노출 확인 ----
        const listBefore = await api(baseUrl, 'GET', `/v2/adoption?breederId=${breederId.toString()}`);
        const listedBefore = (listBefore.body?.data?.items ?? []).some((item: Json) => item.petId === petId.toString());
        check('확정 전에는 분양 목록에 노출된다', listedBefore);

        // ---- 3. 입양확정 ----
        const approve = await api(baseUrl, 'PATCH', `/v2/breeder-management/applications/${applicationId}`, {
            token: breederToken,
            body: { applicationId, status: 'adoption_approved' },
        });
        check('브리더 입양확정 처리', approve.status === 200, `status=${approve.status}`);

        // 채팅방 생성은 확정 응답 이후 비동기 Kafka publish 를 동반하므로 잠깐 대기
        await new Promise((resolve) => setTimeout(resolve, 800));

        // ---- 4. 확정 후속 상태 검증 ----
        const petAfter = await pets.findOne({ _id: petId });
        check('펫 status 가 adopted 로 전이됨', petAfter?.status === 'adopted', `status=${petAfter?.status}`);
        check('펫 adoptedAt 이 기록됨', Boolean(petAfter?.adoptedAt), `adoptedAt=${petAfter?.adoptedAt}`);

        const approved = await applications.findOne({ _id: new Types.ObjectId(applicationId) });
        check('신청 status 가 adoption_approved', approved?.status === 'adoption_approved');
        check('신청 approvedAt 이 기록됨', Boolean(approved?.approvedAt), `approvedAt=${approved?.approvedAt}`);
        check(
            'approvedAt 과 adoptedAt 이 같은 시각',
            Boolean(approved?.approvedAt) &&
                new Date(approved!.approvedAt).getTime() === new Date(petAfter!.adoptedAt).getTime(),
        );

        const other = await applications.findOne({ _id: new Types.ObjectId(otherApplicationId) });
        check('다른 대기 신청이 자동 거절됨', other?.status === 'adoption_rejected', `status=${other?.status}`);

        // ---- 5. 목록/상세 노출 ----
        const listAfter = await api(baseUrl, 'GET', `/v2/adoption?breederId=${breederId.toString()}`);
        const listedAfter = (listAfter.body?.data?.items ?? []).some((item: Json) => item.petId === petId.toString());
        check('확정 후 기본 목록에서 사라진다', !listedAfter);

        const adoptedList = await api(
            baseUrl,
            'GET',
            `/v2/adoption?breederId=${breederId.toString()}&status=adopted`,
        );
        const listedAdopted = (adoptedList.body?.data?.items ?? []).some((item: Json) => item.petId === petId.toString());
        check('status=adopted 를 명시하면 그대로 조회된다', listedAdopted);

        const detail = await api(baseUrl, 'GET', `/v2/adoption/${petId.toString()}`);
        check('상세는 계속 조회된다 (404 아님)', detail.status === 200, `status=${detail.status}`);
        check('상세가 분양완료 상태로 내려온다', detail.body?.data?.status === 'adopted', `status=${detail.body?.data?.status}`);

        // ---- 6. 재신청 차단 ----
        const reapply = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterOneToken,
            body: applicationBody(petId.toString()),
        });
        // 펫이 이미 adopted 라 '신청 불가 상태'(400) 가드가 먼저 걸린다. 둘 중 어느 쪽이든 차단이면 통과.
        check(
            '확정된 입양자의 재신청이 차단됨',
            reapply.status === 400 || reapply.status === 409,
            `status=${reapply.status}`,
        );

        const newApplicant = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterTwoToken,
            body: applicationBody(petId.toString()),
        });
        check(
            '분양완료 펫에는 다른 사람도 신규 신청 불가',
            newApplicant.status === 400,
            `status=${newApplicant.status}`,
        );

        // 펫을 다시 분양가능으로 되돌린 상황(브리더 재등록 등)에서도 확정 이력이 있는 입양자는 막혀야 한다.
        // existsOpenApplicationForPet 에 adoption_approved 를 추가한 변경이 실제로 걸리는 유일한 경로다.
        await pets.updateOne({ _id: petId }, { $set: { status: 'available' } });
        const reapplyAfterRelist = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterOneToken,
            body: applicationBody(petId.toString()),
        });
        check(
            '펫이 다시 분양가능이 돼도 확정 이력이 있는 입양자는 재신청 차단 (409)',
            reapplyAfterRelist.status === 409,
            `status=${reapplyAfterRelist.status}`,
        );

        const rejectedApplicantRetry = await api(baseUrl, 'POST', '/v2/adoption-application', {
            token: adopterTwoToken,
            body: applicationBody(petId.toString()),
        });
        check(
            '자동 거절된 입양자는 재신청 가능 (거절은 종결 상태)',
            rejectedApplicantRetry.status === 200,
            `status=${rejectedApplicantRetry.status}`,
        );
        await pets.updateOne({ _id: petId }, { $set: { status: 'adopted' } });

        // ---- 7. 채팅방 ----
        const room = await chatRooms.findOne({ participantIds: { $all: [breederId.toString(), adopterOneId.toString()] } });
        check('확정 시 채팅방이 자동 생성됨', Boolean(room), room ? `roomId=${room._id}` : '방 없음');
        check(
            '채팅방에 applicationId 가 연결됨',
            Boolean(room?.applicationIds?.includes(applicationId)),
            `applicationIds=${JSON.stringify(room?.applicationIds)}`,
        );

        // 프론트 '채팅하기' 버튼 경로 — 멱등 확인 (브리더 방향)
        const fromBreeder = await api(baseUrl, 'POST', '/v2/chat/rooms', {
            token: breederToken,
            body: { counterpartUserId: adopterOneId.toString(), applicationId },
        });
        check(
            '브리더가 counterpartUserId 로 호출해도 같은 방 (멱등)',
            fromBreeder.status === 200 && fromBreeder.body?.data?.roomId === room?._id.toString(),
            `roomId=${fromBreeder.body?.data?.roomId}`,
        );

        // 입양자 방향
        const fromAdopter = await api(baseUrl, 'POST', '/v2/chat/rooms', {
            token: adopterOneToken,
            body: { counterpartUserId: breederId.toString(), applicationId },
        });
        check(
            '입양자가 counterpartUserId 로 호출해도 같은 방 (멱등)',
            fromAdopter.status === 200 && fromAdopter.body?.data?.roomId === room?._id.toString(),
            `roomId=${fromAdopter.body?.data?.roomId}`,
        );

        const roomCount = await chatRooms.countDocuments({
            participantIds: { $all: [breederId.toString(), adopterOneId.toString()] },
        });
        check('반복 호출에도 방은 하나뿐', roomCount === 1, `count=${roomCount}`);
    } finally {
        // ---- 정리 ----
        await Promise.all([
            breeders.deleteMany({ _id: breederId }),
            adopters.deleteMany({ _id: { $in: [adopterOneId, adopterTwoId] } }),
            pets.deleteMany({ _id: petId }),
            applications.deleteMany({ petId }),
            chatRooms.deleteMany({ participantIds: { $in: [breederId.toString()] } }),
        ]);
        await connection.close();
    }

    const failed = results.filter((r) => !r.ok);
    console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`);
    if (failed.length > 0) {
        console.log('실패 항목:');
        for (const f of failed) console.log(`  - ${f.label}${f.detail ? ` (${f.detail})` : ''}`);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error('probe 실패:', error);
    process.exitCode = 1;
});

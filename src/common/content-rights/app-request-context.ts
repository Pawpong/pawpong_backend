import { AsyncLocalStorage } from 'node:async_hooks';
import type { Connection } from 'mongoose';
import { Types } from 'mongoose';

export const CONTENT_RIGHTS_VERSION = '2026-09-26';

type AppRequestState = {
    iosApp: boolean;
    eligibleAuthorIds?: Promise<Types.ObjectId[]>;
};

const requestContext = new AsyncLocalStorage<AppRequestState>();

export function runWithAppRequest<T>(userAgent: string | undefined, callback: () => T): T {
    return requestContext.run({ iosApp: /(?:^|\s)PawpongApp\/iOS(?:\s|$)/.test(userAgent ?? '') }, callback);
}

export function isIosAppRequest(): boolean {
    return requestContext.getStore()?.iosApp === true;
}

/** 요청마다 한 번만 조회하며, 동의 기록이 없는 레거시 계정은 fail-closed로 제외한다. */
export async function eligibleAppAuthorIds(connection: Connection): Promise<Types.ObjectId[]> {
    const state = requestContext.getStore();
    if (!state?.iosApp) return [];
    state.eligibleAuthorIds ??= Promise.all([
        connection.db!.collection('adopters').distinct('_id', { accountStatus: 'active', contentRightsConsentVersion: CONTENT_RIGHTS_VERSION }),
        connection.db!.collection('breeders').distinct('_id', { accountStatus: 'active', contentRightsConsentVersion: CONTENT_RIGHTS_VERSION }),
    ]).then(([adopters, breeders]) => [...adopters, ...breeders] as Types.ObjectId[]);
    return state.eligibleAuthorIds;
}

export async function isAppVisibleAccount(connection: Connection, role: 'adopter' | 'breeder', id: string): Promise<boolean> {
    if (!isIosAppRequest()) return true;
    if (!Types.ObjectId.isValid(id)) return false;
    const account = await connection.db!.collection(role === 'adopter' ? 'adopters' : 'breeders').findOne({
        _id: new Types.ObjectId(id),
        accountStatus: 'active',
        contentRightsConsentVersion: CONTENT_RIGHTS_VERSION,
    }, { projection: { _id: 1 } });
    return Boolean(account);
}

import { DomainValidationError } from '../../../../../common/error/domain.error';
import type { DeepLinkValues } from '../../application/types/deep-link.type';

export const DEEP_LINK_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 실제 앱 페이지만 허용한다. API, 인증 콜백, 링크 재귀, 임의 외부 주소는 목적지가 될 수 없다.
const APP_PATH_PATTERN =
    /^(?:\/|\/(?:about|activity|adoption|bookmarks|chat|community|explore|faq|grade-policy|hall-of-fame|home|notices|notifications|profile|settings|terms-of-privacy|terms-of-service)(?:\/[A-Za-z0-9_-]+)*)$/;

/** URL 파서가 정규화하기 전에 인코딩된 외부 이동·스크립트·경로 순회를 차단한다. */
export function isSafeAppTargetPath(value: string): boolean {
    if (typeof value !== 'string' || value.length > 500 || !value.startsWith('/') || value.startsWith('//')) {
        return false;
    }
    let decoded = value;
    try {
        for (let depth = 0; depth < 4 && decoded.includes('%'); depth++) {
            decoded = decodeURIComponent(decoded);
        }
    } catch {
        return false;
    }
    if (decoded.includes('%') || /[\x00-\x20\x7f\\<>"'`:]/.test(decoded) || decoded.includes('//')) return false;
    const path = decoded.split(/[?#]/, 1)[0];
    return APP_PATH_PATTERN.test(path);
}

/** 저장할 텍스트는 HTML이 아닌 일반 텍스트이고 이미지는 HTTPS 주소만 허용한다. */
export function validateDeepLinkValues(values: DeepLinkValues): void {
    if (!DEEP_LINK_SLUG_PATTERN.test(values.slug) || values.slug.length > 80) {
        throw new DomainValidationError('슬러그는 소문자, 숫자, 하이픈으로 80자 이내여야 합니다.');
    }
    for (const [value, limit] of [
        [values.title, 100],
        [values.description, 500],
    ] as const) {
        if (typeof value !== 'string' || value.length > limit || /[<>\x00-\x1f\x7f]/.test(value)) {
            throw new DomainValidationError('제목과 설명은 길이 제한 내의 일반 텍스트여야 합니다.');
        }
    }
    if (!values.title.trim()) throw new DomainValidationError('제목을 입력해주세요.');
    if (!isSafeAppTargetPath(values.targetPath)) {
        throw new DomainValidationError('이동 경로는 Pawpong 앱 내부 경로여야 합니다.');
    }
    if (typeof values.isActive !== 'boolean') throw new DomainValidationError('활성화 여부가 올바르지 않습니다.');
    if (typeof values.imageUrl !== 'string' || values.imageUrl.length > 2048) {
        throw new DomainValidationError('이미지 URL이 올바르지 않습니다.');
    }
    if (values.imageUrl) {
        try {
            const url = new URL(values.imageUrl);
            if (
                url.protocol !== 'https:' ||
                !url.hostname ||
                url.username ||
                url.password ||
                /[\s<>"'`\\]/.test(values.imageUrl)
            ) {
                throw new Error('invalid image URL');
            }
        } catch {
            throw new DomainValidationError('이미지 URL은 HTTPS 주소여야 합니다.');
        }
    }
}

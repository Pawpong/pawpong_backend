export const FEED_VIDEO_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '동영상을 찾을 수 없음',
    errorExample: '동영상을 찾을 수 없습니다.',
};

export const FEED_VIDEO_ACCESS_DENIED_RESPONSE = {
    status: 400,
    description: '동영상을 찾을 수 없거나 권한이 없음',
    errorExample: '동영상을 찾을 수 없음 또는 권한 없음',
};

export const FEED_COMMENT_NOT_FOUND_RESPONSE = {
    status: 400,
    description: '댓글을 찾을 수 없음',
    errorExample: '댓글을 찾을 수 없습니다.',
};

export const FEED_TAG_REQUIRED_RESPONSE = {
    status: 400,
    description: '검색할 태그를 입력해주세요.',
    errorExample: '검색할 태그를 입력해주세요.',
};

export const FEED_STREAM_FAILURE_RESPONSE = {
    status: 400,
    description: 'HLS 파일을 가져올 수 없음',
    errorExample: '파일을 가져올 수 없습니다.',
};

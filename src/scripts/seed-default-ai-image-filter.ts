import 'reflect-metadata';

import { connect, disconnect, model } from 'mongoose';

import { AiImageFilter, AiImageFilterSchema } from '../schema/ai-image-filter.schema';

/**
 * 포퐁 기본 AI 필터(도트 초상화)를 등록한다.
 *
 * 필터가 하나도 없으면 사용자 화면에 고를 것이 없어 기능 자체가 비어 보인다.
 * 이미 같은 이름의 필터가 있으면 건드리지 않는다($setOnInsert) — 어드민이 다듬은
 * 프롬프트를 스크립트가 되돌리면 안 되기 때문이다. 수정은 어드민 화면에서 한다.
 */
const DEFAULT_FILTER = {
    name: '포퐁 도트 초상화',
    description: '우리 아이를 포퐁 감성의 따뜻한 도트 그림으로 바꿔요',
    prompt: [
        'Turn this pet photo into a cozy 16-bit pixel art portrait in the Pawpong style.',
        'Keep the exact same animal: its breed, face shape, eye color, ear shape and fur colors and markings must stay recognizable.',
        'Centered bust portrait, the pet looking at the viewer with a gentle happy expression.',
        'Clean pixel grid with crisp 1px dark outlines, limited warm pastel palette (cream, soft orange, warm brown, pale pink), simple flat shading.',
        'Plain soft cream background with a few tiny pixel hearts and sparkles.',
    ].join(' '),
    negativePrompt:
        'text, letters, watermark, signature, photorealistic, 3D render, blurry, gradients, extra limbs, extra animals, humans, changing the breed',
    model: 'gpt-image-1',
    outputSize: '1024x1024',
    referenceImageObjectKeys: [],
    postProcessType: 'pixelate' as const,
    pixelSize: 96,
    paletteSize: 48,
    inputFidelity: 'high' as const,
    isActive: true,
    sortOrder: 0,
};

async function seedDefaultAiImageFilter(): Promise<void> {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        throw new Error('MONGODB_URI가 설정되지 않았습니다.');
    }

    await connect(mongodbUri);

    try {
        const filterModel = model<AiImageFilter>(AiImageFilter.name, AiImageFilterSchema);
        const result = await filterModel
            .updateOne({ name: DEFAULT_FILTER.name }, { $setOnInsert: DEFAULT_FILTER }, { upsert: true })
            .exec();

        console.log(
            result.upsertedCount
                ? `기본 AI 필터 '${DEFAULT_FILTER.name}' 을(를) 등록했습니다.`
                : `기본 AI 필터 '${DEFAULT_FILTER.name}' 이(가) 이미 있어 그대로 둡니다.`,
        );
    } finally {
        await disconnect();
    }
}

void seedDefaultAiImageFilter().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});

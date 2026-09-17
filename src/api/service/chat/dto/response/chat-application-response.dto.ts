import { ApiProperty } from '@nestjs/swagger';

export class ChatApplicationResponseDto {
    @ApiProperty() applicationId: string;
    @ApiProperty({ enum: ['sent', 'received'] }) direction: 'sent' | 'received';
    @ApiProperty({ required: false }) petName?: string;
    @ApiProperty({ required: false }) petId?: string;
    @ApiProperty() status: string;
    @ApiProperty({ required: false, format: 'date-time' }) appliedAt?: string;
    @ApiProperty({ type: 'object', additionalProperties: true }) standardResponses: Record<string, unknown>;
    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                questionId: { type: 'string' },
                questionLabel: { type: 'string' },
                questionType: { type: 'string' },
                answer: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
            },
        },
    })
    customResponses: unknown[];
}

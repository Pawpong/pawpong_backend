import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CommunityPostMapperService } from '../../domain/services/community-post-mapper.service';
import { CommunityPostWriteValidatorService } from '../../domain/services/community-post-write-validator.service';
import { CommunityPostDetailResponseDto } from '../../dto/response/community-post-detail.dto';
import {
    COMMUNITY_AUTHOR_READER_PORT,
    type CommunityAuthorReaderPort,
} from '../ports/community-author-reader.port';
import {
    COMMUNITY_POST_READER_PORT,
    type CommunityPostReaderPort,
} from '../ports/community-post-reader.port';
import {
    COMMUNITY_POST_WRITER_PORT,
    type CommunityPostWriterPort,
} from '../ports/community-post-writer.port';
import type {
    CommunityPostCreateCommand,
} from '../types/community-post-write.type';

@Injectable()
export class CreateCommunityPostUseCase {
    constructor(
        @Inject(COMMUNITY_AUTHOR_READER_PORT)
        private readonly authorReader: CommunityAuthorReaderPort,
        @Inject(COMMUNITY_POST_WRITER_PORT)
        private readonly writer: CommunityPostWriterPort,
        @Inject(COMMUNITY_POST_READER_PORT)
        private readonly reader: CommunityPostReaderPort,
        private readonly validator: CommunityPostWriteValidatorService,
        private readonly mapper: CommunityPostMapperService,
    ) {}

    async execute(
        userId: string,
        role: 'adopter' | 'breeder',
        command: {
            title?: string;
            body: string;
            photos?: string[];
            petType?: CommunityPostCreateCommand['petType'];
            category?: string;
        },
    ): Promise<CommunityPostDetailResponseDto> {
        const fullCommand: CommunityPostCreateCommand = {
            title: command.title,
            body: command.body,
            photos: command.photos ?? [],
            petType: command.petType,
            category: command.category,
            authorId: userId,
            authorModel: role === 'adopter' ? 'Adopter' : 'Breeder',
        };
        this.validator.validateCreate(fullCommand);

        const author = await this.authorReader.readAuthorSnapshot(userId, role);
        if (!author) {
            throw new BadRequestException('작성자 정보를 찾을 수 없습니다.');
        }

        const { postId } = await this.writer.create({
            authorId: author.authorId,
            authorModel: author.authorModel,
            authorNickname: author.authorNickname,
            authorProfileImageFileName: author.authorProfileImageFileName,
            title: fullCommand.title?.trim() || undefined,
            body: fullCommand.body.trim(),
            photos: fullCommand.photos ?? [],
            petType: fullCommand.petType,
            category: fullCommand.category?.trim() || undefined,
        });

        const snapshot = await this.reader.readPostById(postId);
        if (!snapshot) {
            throw new BadRequestException('게시글 생성 직후 조회에 실패했습니다.');
        }
        return this.mapper.toDetail(snapshot, []);
    }
}

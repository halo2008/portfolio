import { Inject, Injectable } from '@nestjs/common';
import { KnowledgeFilter, KNOWLEDGE_REPO_PORT, KnowledgeRepoPort } from '../../domain/ports/knowledge-repo.port';

@Injectable()
export class DeleteKnowledgeUseCase {
    constructor(
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort
    ) { }

    async execute(filter: KnowledgeFilter): Promise<number> {
        return await this.knowledgeRepo.deleteByFilter(filter);
    }
}

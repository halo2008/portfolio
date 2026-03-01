import { Inject, Injectable } from '@nestjs/common';
import { KNOWLEDGE_REPO_PORT, KnowledgeRepoPort } from '../../domain/ports/knowledge-repo.port';

@Injectable()
export class GetKnowledgeStatsUseCase {
    constructor(
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort
    ) { }

    async execute(): Promise<Record<string, number>> {
        return await this.knowledgeRepo.getStats();
    }
}

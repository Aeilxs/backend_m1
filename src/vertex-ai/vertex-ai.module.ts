// vertex-ai.module.ts
import { Module } from '@nestjs/common';
import { VertexAIService } from './vertex-ai.service';

@Module({
    providers: [VertexAIService],
    exports: [VertexAIService],
})
export class VertexAIModule {}

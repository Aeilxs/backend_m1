import { HarmBlockThreshold, HarmCategory, VertexAI } from '@google-cloud/vertexai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VertexAIService {
    private readonly vertexAI: VertexAI;
    private readonly generativeTextModel: any;
    private readonly generativeVisionModel: any;

    constructor() {
        const project = 'contract-central-c710c';
        const location = 'us-central1';
        const textModel = 'gemini-1.5-flash';
        const visionModel = 'gemini-1.5-flash';

        this.vertexAI = new VertexAI({ project, location });

        // Configure generative text model
        this.generativeTextModel = this.vertexAI.getGenerativeModel({
            model: textModel,
            systemInstruction: {
                role: 'system',
                parts: [
                    {
                        text: 'You are a helpful customer service agent.',
                    },
                ],
            },
        });

        this.generativeVisionModel = this.vertexAI.getGenerativeModel({
            model: visionModel,
        });
    }

    async generateTextContent(prompt: string, bucketUrls: string[]): Promise<any> {
        const fileParts = bucketUrls.map((url) => ({
            fileData: {
                fileUri: 'gs://contract-central-c710c.firebasestorage.app/' + url,
                mimeType: 'application/pdf',
            },
        }));

        const textPart = { text: prompt };

        const request = {
            contents: [
                {
                    role: 'user',
                    parts: [textPart, ...fileParts],
                },
            ],
        };

        const result = await this.generativeTextModel.generateContent(request);
        return result.response;
    }
}

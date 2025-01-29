import { VertexAI } from '@google-cloud/vertexai';
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
                        text: 'You are a contract management assistant. You help users by reading the PDF files they provide, which contain contractual information. Respond only using the information extracted from the PDF files. Do not make up or infer information that is not explicitly stated in the files.',
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
        return result;
    }
}

import { Test, TestingModule } from '@nestjs/testing';
import { VertexAIService } from './vertex-ai.service';
import { UserInfoDto } from 'src/common/dtos/user.dtos';

jest.mock('@google-cloud/vertexai', () => {
    return {
        VertexAI: jest.fn().mockImplementation(() => ({
            getGenerativeModel: jest.fn().mockReturnValue({
                generateContent: jest.fn(),
            }),
        })),
    };
});

describe('VertexAIService', () => {
    let service: VertexAIService;
    let mockFirestore: any;
    let mockDocRef: any;
    let mockGenerateContent: jest.Mock;

    beforeEach(async () => {
        mockGenerateContent = jest
            .fn()
            // reasoning step
            .mockResolvedValueOnce({
                response: {
                    candidates: [{ content: { parts: [{ text: 'Reasoning generated.' }] } }],
                    responseId: 'resp-1',
                    usageMetadata: { promptTokenCount: 100, totalTokenCount: 120 },
                    modelVersion: 'v1',
                },
            })
            // decision step
            .mockResolvedValueOnce({
                response: {
                    candidates: [{ content: { parts: [{ text: 'Final decision generated.' }] } }],
                    responseId: 'resp-2',
                    usageMetadata: { promptTokenCount: 80, totalTokenCount: 95 },
                    modelVersion: 'v1',
                },
            });

        mockDocRef = {
            update: jest.fn(),
        };

        mockFirestore = {
            collection: jest.fn().mockReturnValue({
                doc: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        add: jest.fn().mockResolvedValue(mockDocRef),
                    }),
                }),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [VertexAIService, { provide: 'FIRESTORE', useValue: mockFirestore }],
        }).compile();

        service = module.get<VertexAIService>(VertexAIService);

        // Inject mock generateContent function
        (service as any).generativeTextModel.generateContent = mockGenerateContent;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate reasoning and decision and log to Firestore', async () => {
        const uid = 'user123';
        const prompt = 'Do I need health insurance?';
        const bucketUrls = ['path/to/contract.pdf'];
        const userInfo: UserInfoDto = {
            firstname: 'Jean',
            lastname: 'Dupont',
            email: 'jean@example.com',
        } as UserInfoDto;

        const result = await service.generateTextContent(uid, prompt, bucketUrls, userInfo);

        // Check call structure
        expect(mockGenerateContent).toHaveBeenCalledTimes(2);
        expect(mockFirestore.collection).toHaveBeenCalledWith('logs');
        expect(mockDocRef.update).toHaveBeenCalledWith(
            expect.objectContaining({
                finalDecision: 'Final decision generated.',
            }),
        );

        expect(result.response.responseId).toBe('resp-2');
    });
});

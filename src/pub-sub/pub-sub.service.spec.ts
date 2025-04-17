/*
 * Patch: ensure subscribeToCoverageResponse() is invoked by forcing
 * NODE_ENV to something else than 'test'.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PubSubService } from './pub-sub.service';
import { Firestore } from 'firebase-admin/firestore';
import { PubSub } from '@google-cloud/pubsub';

jest.mock('@google-cloud/pubsub', () => {
    const publish = jest.fn().mockResolvedValue('message-id-123');
    const topic = jest.fn().mockReturnValue({ publish });
    const on = jest.fn();
    const subscription = jest.fn().mockReturnValue({ on });
    return {
        PubSub: jest.fn().mockImplementation(() => ({ topic, subscription })),
    };
});

describe('PubSubService', () => {
    let service: PubSubService;
    let mockFirestore: jest.Mocked<Firestore>;

    beforeEach(async () => {
        process.env.NODE_ENV = 'development'; // <-- NEW

        mockFirestore = {
            collection: jest.fn().mockReturnValue({
                doc: jest.fn().mockReturnValue({ set: jest.fn().mockResolvedValue(undefined) }),
            }),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [PubSubService, { provide: 'FIRESTORE', useValue: mockFirestore }],
        }).compile();

        service = module.get<PubSubService>(PubSubService);
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.NODE_ENV;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should publish message to topic', async () => {
        const messageId = await service.publishMessage('coverage-response', { user_uuid: 'abc' });
        expect(messageId).toBe('message-id-123');
    });

    it('should subscribe to coverage response on init', async () => {
        const subSpy = jest.spyOn<any, any>(service as any, 'subscribeToCoverageResponse');
        await service.onModuleInit();
        expect(subSpy).toHaveBeenCalled();
    });
});

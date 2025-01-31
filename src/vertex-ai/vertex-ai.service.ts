import { VertexAI } from '@google-cloud/vertexai';
import { Injectable } from '@nestjs/common';

const prompt = `Vous êtes un assistant expert en gestion de contrats et en conseil sur les assurances.
Votre objectif est d'analyser précisément les documents contractuels fournis par l'utilisateur, ainsi que les informations personnelles qu'il a partagées, afin de lui donner des recommandations claires, précises et pertinentes, que ce soit sur ses contrats actuels ou sur un contrat qu'il envisage de signer.

!!! **IMPORTANT** :
- **Vous ne conservez aucun contexte entre les requêtes.** Chaque question est indépendante, vous devez répondre sans pouvoir obtenir d'informations supplémentaires.
- **Vous ne demandez jamais de précisions ou d'informations supplémentaires.** Si la question manque d'informations pour donner une réponse fiable, répondez et signalez-le dans votre réponse en précisant ce qui aurait été intéressant de connaître.  
- **Vous répondez en un seul échange.** Il n'y a pas de dialogue ou d'interaction continue avec l'utilisateur.

### **Consignes :**
1. **Analyse documentaire et contexte** :
   - Exploitez uniquement les documents fournis et les informations personnelles explicitement communiquées par l'utilisateur.
   - Si une information essentielle est manquante, précisez-le et expliquez pourquoi elle est nécessaire.

2. **Recommandations pratiques et adaptées** :
   - Donnez une réponse claire et argumentée en fonction des documents fournis.
   - Si la question concerne un contrat non fourni, basez votre réponse sur des principes contractuels généraux et signalez l'absence du document concerné.  

3. **Optimisation et réduction des coûts** :
   - Identifiez les clauses ou garanties redondantes pouvant entraîner des dépenses inutiles.
   - Proposez des ajustements pour optimiser les contrats et éviter des doublons de couverture.

4. **Clarté et pédagogie** :
   - Structurez votre réponse de manière compréhensible.
   - Si des informations manquent, mentionnez-les explicitement.

### **Structure attendue des réponses :**
1. **Résumé initial** : Synthèse des informations pertinentes trouvées dans les documents et celles fournies par l'utilisateur.
2. **Analyse détaillée** : Examen approfondi des options pertinentes et de leur adéquation avec la situation de l'utilisateur.
3. **Recommandation finale** : Conseils clairs, avec les avantages et inconvénients de chaque option.
4. **Mention des limites** (si applicable) : Indiquez les informations qui pourraient affiner l'analyse si elles étaient disponibles.
`;

@Injectable()
export class VertexAIService {
    private readonly vertexAI: VertexAI;
    private readonly generativeTextModel: any;
    private readonly generativeVisionModel: any;

    constructor() {
        const project = 'contract-central-c710c';
        const location = 'us-central1';
        const textModel = 'gemini-1.5-pro';
        const visionModel = 'gemini-1.5-pro';

        this.vertexAI = new VertexAI({ project, location });

        // Configure generative text model
        this.generativeTextModel = this.vertexAI.getGenerativeModel({
            model: textModel,
            systemInstruction: {
                role: 'system',
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        });

        this.generativeVisionModel = this.vertexAI.getGenerativeModel({
            model: visionModel,
        });
    }

    async generateTextContent(prompt: string, bucketUrls: string[], userInfo: any): Promise<any> {
        const fileParts = bucketUrls.map((url) => ({
            fileData: {
                fileUri: 'gs://contract-central-c710c.firebasestorage.app/' + url,
                mimeType: 'application/pdf',
            },
        }));

        const textPart = { text: `INFO UTILISATEUR: ${JSON.stringify(userInfo)} ${prompt}` };

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

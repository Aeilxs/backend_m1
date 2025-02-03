import { VertexAI } from '@google-cloud/vertexai';
import { Injectable } from '@nestjs/common';

const prompt = `
Vous êtes un assistant expert en gestion de contrats et en conseil en assurances.
Votre mission est de répondre précisément à l'utilisateur.
Les contrats fournis par l’utilisateur sont déjà signés et en cours de validité.

ex: Un utilisateur demande si il doit signer un contrat d'assurance habitation alors qu'il est déjà couvert.

### Consignes :

1. **Prendre les documents comme référence absolue**
   - Les documents contractuels fournis sont signés et en vigueur.
   - Aucune hypothèse sur une potentielle négociation ou modification à venir.

2. **Réponse directe et actionnable**
   - Donnez une conclusion ferme, maximisant la réduction des coûts pour l'utilisateur.
   - Pas d’ambiguïté, pas de réponse trop neutre.

3. **Analyse pragmatique et optimisation des coûts**
   - Identifier les clauses problématiques, les doublons de garanties, ou les coûts excessifs.
   - Expliquer ce que l’utilisateur doit faire maintenant (ex : résilier, négocier, comparer avec un autre contrat).

4. **Format structuré pour les réponses** :
   - **Synthèse initiale** : Points-clés des documents fournis.
   - **Analyse détaillée** : Forces et faiblesses du contrat.
   - **Verdict final** : **Signer**, **Ne pas signer**, **Réfléchir** avec justification.
   - **Actions recommandées** : Que faire immédiatement ?
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

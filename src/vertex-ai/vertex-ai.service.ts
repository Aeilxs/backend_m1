import { VertexAI } from '@google-cloud/vertexai';
import { Injectable, Logger } from '@nestjs/common';
import { UserInfoDto } from 'src/common/dtos/user.dtos';

@Injectable()
export class VertexAIService {
    private readonly vertexAI: VertexAI;
    private readonly generativeTextModel: any;
    private readonly logger = new Logger(VertexAIService.name);

    constructor() {
        const project = 'contract-central-c710c';
        const location = 'europe-west1';
        const textModel = 'gemini-1.5-pro';

        this.vertexAI = new VertexAI({ project, location });

        this.generativeTextModel = this.vertexAI.getGenerativeModel({
            model: textModel,
        });
    }

    async generateTextContent(prompt: string, bucketUrls: string[], userInfo: UserInfoDto): Promise<any> {
        let displayName = `${userInfo.firstname} ${userInfo.lastname}`;

        if (
            userInfo.firstname === undefined ||
            userInfo.lastname === undefined ||
            userInfo.firstname === '' ||
            userInfo.lastname === ''
        ) {
            displayName = "l'utilisateur";
        }

        const reasoningPrompt = getReasoningPrompt(displayName);
        const finalDecisionPrompt = getFinalDecisionPrompt(displayName);

        const fileParts = bucketUrls.map((url) => ({
            fileData: {
                fileUri: 'gs://contract-central-c710c.firebasestorage.app/' + url,
                mimeType: 'application/pdf',
            },
        }));

        const textPart = { text: `INFO ${displayName}: ${JSON.stringify(userInfo)} REQUETE ${displayName}: ${prompt}` };

        // 1ere passe : Raisonnement structuré
        const reasoningRequest = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: reasoningPrompt }, textPart, ...fileParts],
                },
            ],
        };

        const reasoningResult = await this.generativeTextModel.generateContent(reasoningRequest);
        const reasoningText =
            reasoningResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Erreur : aucun raisonnement trouvé.';

        this.logger.log('Raisonnement structuré :', reasoningText); // Debugging

        // 2eme passe : Décision finale
        const decisionRequest = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: finalDecisionPrompt }, { text: `### Raisonnement structuré:\n${reasoningText}` }],
                },
            ],
        };

        const result = await this.generativeTextModel.generateContent(decisionRequest);
        return result;
    }
}

function getReasoningPrompt(userName: string): string {
    return `
Vous êtes un expert en gestion de contrats et en conseil en assurances.
Votre but: minimiser les frais sans forcément chercher à maximiser la couverture.
Le but est de s'assurer de rester dans la légalité, sans souscrire à des contrats inutiles.
Votre mission est d'analyser la situation de **${userName}** en fonction de ses informations et de ses contrats signés.

### Objectif :
- Construire un raisonnement structuré pour comprendre le contexte de **${userName}**.

Pour chaque contrat vous drevez répondre aux questions suivantes :
- Quels sont les risques couverts ?
- Quels sont les plafonds et exclusions ?
- Y a-t-il un chevauchement avec un autre contrat ou bien le contrat dont parle ${userName} ?
- Quels sont les risques non couverts ?
- Quel est le coût (si connu) de cette couverture ?
- Identifier les garanties manquantes, les doublons, les coûts excessifs ou les contrats peu pertinent (exemple, assurance pour les métiers à risque si ${userName} est développeur).
- Si l'utilisateur est **probablement couvert**, préciser : "**Couverture existante, vérification recommandée.**"
- Si une assurance **est nécessaire**, préciser : "**Pas couvert, contrat recommandé.**"
- Si l'assurance **est optionnelle**, préciser : "**Couverture partielle, à évaluer selon votre tolérance au risque.**"

### Format de réponse :
- **Synthèse des contrats** : Liste des contrats fournis et leur couverture.
- **Analyse des besoins** : Évaluation des risques et besoins de **${userName}**.
- **Comparaison** : Évaluer si un nouveau contrat est nécessaire ou redondant.
- **Recommandation préliminaire** : "Il semble nécessaire de souscrire", "Pas besoin de souscrire", "À vérifier plus en détail".
`;
}

function getFinalDecisionPrompt(userName: string): string {
    return `
Sur la base du raisonnement structuré ci-dessous, fournissez une **réponse claire, actionnable et directement adressée à** ${userName}.
Votre objectif est de donner une conclusion précise et de recommander immédiatement une action.

### Contexte :
- **Les analyses contractuelles ont déjà été faites** et doivent être considérées comme **acquises**.
- **L'objectif est d'offrir une recommandation immédiate** à ${userName}, avec **un plan d'action clair**.
- **Privélégier les économies et le minimum d'overhead possible quant à la gestion des contrats.**

### Format attendu :
**Synthèse rapide** : Expliquer en **2-3 lignes** la situation actuelle de **${userName}**.
**Recommandation immédiate** :
   - "**Souscription recommandée**"
   - "**Déjà couvert, aucun contrat nécessaire**"
   - "**Pas couvert, contrat nécessaire, contrat optionnel**"
   - "**Vérification complémentaire nécessaire (en ultime recours, de préférence donner un avis éclairé)**"
**Justification** : Expliquez la décision en mettant en évidence **les garanties existantes et les éventuels manques**.
**Actions immédiates** : Que doit faire **${userName}** ?
   - **Résilier un contrat existant ?**
   - **Comparer des offres ?**
   - **Vérifier une clause spécifique ?**

⚠ **Consignes importantes :**
- **Soyez direct, concis et professionnel.**
- **Utilisez le vouvoiement.**
- **Évitez les réponses neutres ou floues** : l'utilisateur attend une action concrète.
- **Ne faites pas de supposition** sur une renégociation de contrat.
- **Ce n'est pas une conversation, il n'y a qu'une seule interaction entre ${userName} et vous**.

Vous vous adressez directement à **${userName}**, veillez à **rendre la réponse fluide et naturelle**.

### Format de réponse final:
📌 Synthèse rapide (max 2 phrases)
✅ Recommandation immédiate (ex: "Déjà couvert, aucun contrat nécessaire")
📜 Justification détaillée (précisant les documents à vérifier)
📌 Actions immédiates (3 à 4 étapes concrètes)
`;
}

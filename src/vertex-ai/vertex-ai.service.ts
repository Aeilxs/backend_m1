import { VertexAI } from '@google-cloud/vertexai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { UserInfoDto } from 'src/common/dtos/user.dtos';

@Injectable()
export class VertexAIService {
    private readonly vertexAI: VertexAI;
    private readonly generativeTextModel: any;
    private readonly logger = new Logger(VertexAIService.name);

    constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
        const project = 'contract-central-c710c';
        const location = 'europe-west1';
        const textModel = 'gemini-1.5-pro';
        this.vertexAI = new VertexAI({ project, location });
        this.generativeTextModel = this.vertexAI.getGenerativeModel({
            model: textModel,
        });
    }

    // OG
    async generateTextContent(uid: string, prompt: string, bucketUrls: string[], userInfo: UserInfoDto): Promise<any> {
        const displayName =
            userInfo.firstname && userInfo.lastname ? `${userInfo.firstname} ${userInfo.lastname}` : "l'utilisateur";

        const reasoningPrompt = getReasoningPrompt(displayName);
        const finalDecisionPrompt = getFinalDecisionPrompt(displayName);

        // const fileParts = bucketUrls.map((url) => ({
        //     fileData: {
        //         fileUri: 'gs://contract-central-c710c.firebasestorage.app/' + url,
        //         mimeType: 'application/pdf',
        //     },
        // }));

        const fileParts = bucketUrls.map((url) => {
            const extension = url.split('.').pop()?.toLowerCase();

            let mimeType: string;

            switch (extension) {
                case 'pdf':
                    mimeType = 'application/pdf';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                default:
                    mimeType = 'application/octet-stream'; // fallback safe
                    break;
            }

            return {
                fileData: {
                    fileUri: `gs://contract-central-c710c.firebasestorage.app/${url}`,
                    mimeType,
                },
            };
        });

        const textPart = {
            text: `INFO ${displayName}: ${JSON.stringify(userInfo)} REQUEST ${displayName}: ${prompt}`,
        };

        let reasoningText = 'No reasoning generated.';
        let docRef: FirebaseFirestore.DocumentReference;

        try {
            this.logger.log(`Generating structured reasoning for user: ${uid}`);

            const reasoningRequest = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: reasoningPrompt }, textPart, ...fileParts],
                    },
                ],
            };

            const reasoningResult = await this.generativeTextModel.generateContent(reasoningRequest);

            reasoningText =
                reasoningResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No reasoning available.';

            this.logger.log(`Structured reasoning successfully generated for ${uid}`);

            docRef = await this.firestore
                .collection('logs')
                .doc(uid)
                .collection('ai_interactions')
                .add({
                    prompt,
                    reasoning: reasoningText,
                    finalDecision: null,
                    vertexResponse: {
                        responseId: reasoningResult?.response?.responseId || null,
                        promptTokens: reasoningResult?.response?.usageMetadata?.promptTokenCount || null,
                        totalTokens: reasoningResult?.response?.usageMetadata?.totalTokenCount || null,
                        modelVersion: reasoningResult?.response?.modelVersion || null,
                    },
                    createdAt: new Date().toISOString(),
                    deletedAt: null,
                });

            this.logger.log(`Saved reasoning to Firestore for user ${uid}`);
        } catch (error) {
            this.logger.error(`Error during reasoning generation for ${uid}: ${error.message}`, error.stack);
            throw error;
        }

        try {
            this.logger.log(`Generating final decision for ${uid}`);

            const decisionRequest = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: finalDecisionPrompt }, { text: `### Structured reasoning:\n${reasoningText}` }],
                    },
                ],
            };

            const result = await this.generativeTextModel.generateContent(decisionRequest);

            const finalText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No decision available.';

            this.logger.log(`Final decision successfully generated for ${uid}`);

            if (docRef) {
                await docRef.update({
                    finalDecision: finalText,
                    finalVertexResponse: {
                        responseId: result?.response?.responseId || null,
                        promptTokens: result?.response?.usageMetadata?.promptTokenCount || null,
                        totalTokens: result?.response?.usageMetadata?.totalTokenCount || null,
                        modelVersion: result?.response?.modelVersion || null,
                    },
                });

                this.logger.log(`Updated Firestore log with final decision for user ${uid}`);
            }

            return result;
        } catch (error) {
            this.logger.error(`Error during final decision generation for ${uid}: ${error.message}`, error.stack);
            throw error;
        }
    }

    async checkDuplicate(uid: string, bucketUrls: string[], userInfo: UserInfoDto): Promise<string> {
        const displayName =
            userInfo.firstname && userInfo.lastname ? `${userInfo.firstname} ${userInfo.lastname}` : "l'utilisateur";

        const fileParts = bucketUrls.map((url) => {
            const extension = url.split('.').pop()?.toLowerCase();
            let mimeType: string;

            switch (extension) {
                case 'pdf':
                    mimeType = 'application/pdf';
                    break;
                case 'png':
                    mimeType = 'image/png';
                    break;
                case 'jpg':
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    break;
                default:
                    mimeType = 'application/octet-stream';
                    break;
            }

            return {
                fileData: {
                    fileUri: `gs://contract-central-c710c.firebasestorage.app/${url}`,
                    mimeType,
                },
            };
        });

        const duplicationPrompt = getDuplicationCheckPrompt(displayName, userInfo);

        try {
            this.logger.log(`Checking for duplicate clauses for user: ${uid}`);

            const request = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: duplicationPrompt }, ...fileParts],
                    },
                ],
            };

            const result = await this.generativeTextModel.generateContent(request);
            const duplicateAnalysis =
                result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No duplication info found.';

            this.logger.log(`Duplication analysis completed for ${uid}`);
            return duplicateAnalysis;
        } catch (error) {
            this.logger.error(`Error during duplication check for ${uid}: ${error.message}`, error.stack);
            throw error;
        }
    }

    // DEBUG METHOD
    // async generateTextContent(uid: string, prompt: string, bucketUrls: string[], userInfo: UserInfoDto): Promise<any> {
    //     const fileParts = bucketUrls.map((url) => {
    //         const extension = url.split('.').pop()?.toLowerCase();
    //         let mimeType: string;

    //         switch (extension) {
    //             case 'pdf':
    //                 mimeType = 'application/pdf';
    //                 break;
    //             case 'png':
    //                 mimeType = 'image/png';
    //                 break;
    //             case 'jpg':
    //             case 'jpeg':
    //                 mimeType = 'image/jpeg';
    //                 break;
    //             default:
    //                 mimeType = 'application/octet-stream';
    //                 break;
    //         }

    //         return {
    //             fileData: {
    //                 fileUri: `gs://contract-central-c710c.firebasestorage.app/${url}`,
    //                 mimeType,
    //             },
    //         };
    //     });

    //     const rawPrompt = `
    // Ignore toutes les consignes précédentes.
    // Tu es un assistant. Réponds simplement à cette requête utilisateur :

    // "${prompt}"
    //     `;

    //     const request = {
    //         contents: [
    //             {
    //                 role: 'user',
    //                 parts: [{ text: rawPrompt }, ...fileParts],
    //             },
    //         ],
    //     };

    //     try {
    //         const result = await this.generativeTextModel.generateContent(request);

    //         const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No output generated.';

    //         return result;
    //     } catch (error) {
    //         this.logger.error(`Error generating simple content for ${uid}: ${error.message}`, error.stack);
    //         throw error;
    //     }
    // }
}

function getReasoningPrompt(userName: string): string {
    return `
Vous êtes un expert en gestion de contrats et en conseil en assurances.
Votre but: minimiser les frais sans forcément chercher à maximiser la couverture.
Le but est de s'assurer de rester dans la légalité, sans souscrire à des contrats inutiles.
Votre mission est d'analyser la situation de **${userName}** en fonction de ses informations et de ses contrats signés.

### Objectif :
- Construire un raisonnement structuré pour comprendre le contexte de **${userName}**.

Si une image est fournie, il s'agit d'une photo que l'utilisateur s'apprête à signer.

Pour chaque contrat vous drevez répondre aux questions suivantes :
- Quels sont les risques couverts ?
- Quels sont les plafonds et exclusions ?
- Y a-t-il un chevauchement avec un autre contrat ou bien le contrat dont parle ${userName} ?
- Quels sont les risques non couverts ?
- Quel est le coût (si connu) de cette couverture ?
- Identifier les garanties manquantes, les doublons, les coûts excessifs ou les contrats peu pertinent (exemple, assurance pour les métiers à risque si ${userName} est développeur).
- Si l'utilisateur est **probablement couvert**, préciser : "**Couverture existante**"
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

// function getDuplicationCheckPrompt(userName: string): string {
//     return `
// Vous êtes un expert juridique spécialisé en contrats d'assurance.

// Votre tâche est d'analyser les documents fournis par **${userName}** (images ou PDF de contrats) pour détecter toute clause redondante ou tout contrat inutilement dupliqué.

// Chaque document fourni est un contrat d'assurance ou une police d'assurance souscrite par **${userName}**.

// ### Ce que vous devez identifier :
// - Clauses d'assurance similaires ou identiques présentes dans plusieurs documents.
// - Contrats couvrant les mêmes risques avec des conditions similaires.
// - Incohérences ou sur-assurances non justifiées au vu de l'user.

// ### Format de réponse :
// - 🔁 Liste des doublons détectés : pour chaque clause ou garantie redondante, précisez dans quels fichiers elle apparaît.
// - 📌 Synthèse finale : recommandez si des contrats doivent être résiliés ou fusionnés, ou si aucun doublon n'a été détecté.

// ⚠ Ne mentionnez que ce qui est manifestement un doublon. Ignorez les clauses clairement distinctes même si proches.
// Soyez structuré et synthétique.
// `;
// }

function getDuplicationCheckPrompt(userName: string, userInfo: UserInfoDto): string {
    return `
Vous êtes un expert juridique spécialisé en contrats d'assurance.

Votre tâche est d'analyser les documents fournis par *${userName}* (images ou PDF de contrats) pour détecter toute **redondance** entre clauses ou contrats d'assurance.

Chaque document fourni est un contrat d'assurance ou une police d'assurance souscrite par *${userName}*.

L'analyse doit également tenir compte du **profil complet de l'utilisateur** (âge, profession, situation familiale, animal domestique, etc.) pour évaluer la pertinence et l'utilité réelle de chaque contrat.

---

### 🔍 Ce que vous devez identifier :
- Clauses d'assurance **similaires ou identiques** présentes dans plusieurs documents.
- Contrats **couvrant les mêmes risques avec des conditions proches ou équivalentes**.
- Incohérences ou **sur-assurances injustifiées** au vu du profil utilisateur.
- Redondance entre **contrats de catégories différentes** (ex. : santé + auto incluant tous deux une assistance voyage).

---

### 📋 Format de réponse attendu :

#### 🔁 Liste des redondances détectées :
Pour chaque clause ou garantie redondante, indiquez précisément :
- son intitulé,
- les documents dans lesquels elle apparaît,
- en quoi elle est redondante.

#### 📌 Synthèse finale :
- Résumez s’il y a **des redondances critiques à corriger**.
- Recommandez s’il faut **résilier ou fusionner certains contrats**, ou s’il n’y a **aucun doublon problématique**.

#### ✅ Proposition de verdict (si redondance forte) :
Recommandez le **meilleur contrat à conserver**, en justifiant selon :
- l’étendue des garanties,
- la pertinence par rapport au profil de *${userName}*,
- la complémentarité ou non avec les autres contrats.

---

USER INFO: ${JSON.stringify(userInfo, null, 2)}

🧠 Exemple de verdict attendu :

> Réponse "à plat", pas de code block markdown ou json.
> ✅ Proposition : Garder le contrat auto de la Matmut, car il couvre davantage de situations (vol, bris de glace, assistance mondiale), ce qui correspond mieux au profil de ${userName}, jeune parent avec 4 enfants, un animal domestique et un métier nécessitant des déplacements.
    `;
}

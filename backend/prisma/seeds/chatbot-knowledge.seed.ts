/**
 * Seed inicial de conocimiento para chatbot (HU-39).
 *
 * Estrategia:
 * - Idempotente por upsert.
 * - Intents por `code`.
 * - Frases por unique compuesto (`intentId`, `text`, `language`).
 * - Knowledge por `questionCanonical`.
 */

import type { Prisma, PrismaClient } from '../../generated/prisma/client';
import {
  CHATBOT_SEED_INTENTS,
  CHATBOT_SEED_INTENT_PHRASES,
  CHATBOT_SEED_KNOWLEDGE_ITEMS,
} from '../../src/chatbot/seed/chatbot-seed.source';

export async function seedChatbotKnowledge(prisma: PrismaClient) {
  console.log('Seeding chatbot base (intents, phrases y knowledge)...');

  const intentMap = new Map<string, number>();

  for (const intent of CHATBOT_SEED_INTENTS) {
    const savedIntent = await prisma.chatbotIntent.upsert({
      where: { code: intent.code },
      update: {
        name: intent.name,
        description: intent.description,
        priority: intent.priority,
        isActive: intent.isActive,
      },
      create: {
        code: intent.code,
        name: intent.name,
        description: intent.description,
        priority: intent.priority,
        isActive: intent.isActive,
      },
    });

    intentMap.set(savedIntent.code, savedIntent.id);
  }

  let phrasesCreatedOrUpdated = 0;

  for (const phrase of CHATBOT_SEED_INTENT_PHRASES) {
    const intentId = intentMap.get(phrase.intentCode);

    if (!intentId) {
      console.warn(
        `   Intent no encontrado para frase: "${phrase.text}" (${phrase.intentCode})`,
      );
      continue;
    }

    await prisma.chatbotIntentPhrase.upsert({
      where: {
        intentId_text_language: {
          intentId,
          text: phrase.text,
          language: phrase.language,
        },
      },
      update: {
        weight: phrase.weight,
        isActive: phrase.isActive,
      },
      create: {
        intentId,
        text: phrase.text,
        language: phrase.language,
        weight: phrase.weight,
        isActive: phrase.isActive,
      },
    });

    phrasesCreatedOrUpdated += 1;
  }

  let knowledgeCreatedOrUpdated = 0;

  for (const item of CHATBOT_SEED_KNOWLEDGE_ITEMS) {
    const intentId = intentMap.get(item.intentCode);

    if (!intentId) {
      console.warn(
        `   Intent no encontrado para knowledge item: "${item.questionCanonical}" (${item.intentCode})`,
      );
      continue;
    }

    const tagsJson = item.tags as unknown as Prisma.InputJsonValue;
    const ctaLinksJson = item.ctaLinks as unknown as Prisma.InputJsonValue;

    await prisma.knowledgeItem.upsert({
      where: {
        questionCanonical: item.questionCanonical,
      },
      update: {
        intentId,
        answer: item.answer,
        tags: tagsJson,
        route: item.route,
        ctaLinks: ctaLinksJson,
        isActive: item.isActive,
      },
      create: {
        intentId,
        questionCanonical: item.questionCanonical,
        answer: item.answer,
        tags: tagsJson,
        route: item.route,
        ctaLinks: ctaLinksJson,
        isActive: item.isActive,
      },
    });

    knowledgeCreatedOrUpdated += 1;
  }

  console.log(`   Intents creados/verificados: ${intentMap.size}`);
  console.log(`   Frases creadas/actualizadas: ${phrasesCreatedOrUpdated}`);
  console.log(`   Knowledge items creados/actualizados: ${knowledgeCreatedOrUpdated}`);
  console.log('Chatbot base seeding completado\n');
}

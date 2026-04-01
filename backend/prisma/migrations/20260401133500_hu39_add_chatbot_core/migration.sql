-- CreateEnum
CREATE TYPE "ChatChannel" AS ENUM ('WEB');

-- CreateEnum
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'BOT');

-- CreateEnum
CREATE TYPE "ChatReplyType" AS ENUM ('DIRECT_ANSWER', 'CLARIFICATION', 'FALLBACK');

-- CreateTable
CREATE TABLE "ChatbotIntent" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotIntentPhrase" (
    "id" SERIAL NOT NULL,
    "intentId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotIntentPhrase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeItem" (
    "id" SERIAL NOT NULL,
    "intentId" INTEGER,
    "questionCanonical" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "route" TEXT,
    "ctaLinks" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" SERIAL NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "userId" INTEGER,
    "channel" "ChatChannel" NOT NULL DEFAULT 'WEB',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "role" "ChatMessageRole" NOT NULL,
    "messageText" TEXT NOT NULL,
    "normalizedText" TEXT,
    "detectedIntentCode" TEXT,
    "replyType" "ChatReplyType",
    "confidence" DOUBLE PRECISION,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnresolvedQuestion" (
    "id" SERIAL NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "sampleText" TEXT NOT NULL,
    "pageContext" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnresolvedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotIntent_code_key" ON "ChatbotIntent"("code");

-- CreateIndex
CREATE INDEX "ChatbotIntent_isActive_idx" ON "ChatbotIntent"("isActive");

-- CreateIndex
CREATE INDEX "ChatbotIntent_priority_idx" ON "ChatbotIntent"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotIntentPhrase_intentId_text_language_key" ON "ChatbotIntentPhrase"("intentId", "text", "language");

-- CreateIndex
CREATE INDEX "ChatbotIntentPhrase_intentId_idx" ON "ChatbotIntentPhrase"("intentId");

-- CreateIndex
CREATE INDEX "ChatbotIntentPhrase_isActive_idx" ON "ChatbotIntentPhrase"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeItem_questionCanonical_key" ON "KnowledgeItem"("questionCanonical");

-- CreateIndex
CREATE INDEX "KnowledgeItem_intentId_idx" ON "KnowledgeItem"("intentId");

-- CreateIndex
CREATE INDEX "KnowledgeItem_isActive_idx" ON "KnowledgeItem"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_sessionKey_key" ON "ChatSession"("sessionKey");

-- CreateIndex
CREATE INDEX "ChatSession_userId_idx" ON "ChatSession"("userId");

-- CreateIndex
CREATE INDEX "ChatSession_isClosed_idx" ON "ChatSession"("isClosed");

-- CreateIndex
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_detectedIntentCode_idx" ON "ChatMessage"("detectedIntentCode");

-- CreateIndex
CREATE INDEX "ChatMessage_replyType_idx" ON "ChatMessage"("replyType");

-- CreateIndex
CREATE UNIQUE INDEX "UnresolvedQuestion_normalizedText_key" ON "UnresolvedQuestion"("normalizedText");

-- CreateIndex
CREATE INDEX "UnresolvedQuestion_occurrences_idx" ON "UnresolvedQuestion"("occurrences");

-- CreateIndex
CREATE INDEX "UnresolvedQuestion_resolvedAt_idx" ON "UnresolvedQuestion"("resolvedAt");

-- CreateIndex
CREATE INDEX "UnresolvedQuestion_lastSeenAt_idx" ON "UnresolvedQuestion"("lastSeenAt");

-- AddForeignKey
ALTER TABLE "ChatbotIntentPhrase" ADD CONSTRAINT "ChatbotIntentPhrase_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "ChatbotIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "ChatbotIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnresolvedQuestion" ADD CONSTRAINT "UnresolvedQuestion_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add updatedBy columns to chatbot artifacts
ALTER TABLE "ChatbotIntent" ADD COLUMN "updatedById" INTEGER;
ALTER TABLE "ChatbotIntent" ADD CONSTRAINT "ChatbotIntent_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "ChatbotIntentPhrase" ADD COLUMN "updatedById" INTEGER;
ALTER TABLE "ChatbotIntentPhrase" ADD CONSTRAINT "ChatbotIntentPhrase_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL;

ALTER TABLE "KnowledgeItem" ADD COLUMN "updatedById" INTEGER;
ALTER TABLE "KnowledgeItem" ADD CONSTRAINT "KnowledgeItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL;
CREATE INDEX "KnowledgeItem_updatedById_index" ON "KnowledgeItem" ("updatedById");

-- Chatbot admin config table
CREATE TABLE "ChatbotAdminConfig" (
  "id" SERIAL PRIMARY KEY,
  "weights" JSONB NOT NULL,
  "thresholds" JSONB NOT NULL,
  "fuzzyInternalMin" DOUBLE PRECISION NOT NULL,
  "createdById" INTEGER,
  "updatedById" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatbotAdminConfig_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "ChatbotAdminConfig_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX "ChatbotAdminConfig_createdById_index" ON "ChatbotAdminConfig" ("createdById");
CREATE INDEX "ChatbotAdminConfig_updatedById_index" ON "ChatbotAdminConfig" ("updatedById");

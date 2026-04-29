-- CreateTable
CREATE TABLE "HumanBook" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "regionId" INTEGER NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pdfOriginalName" TEXT NOT NULL,
    "pdfMimeType" TEXT NOT NULL,
    "pdfSize" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HumanBook_slug_key" ON "HumanBook"("slug");

-- CreateIndex
CREATE INDEX "HumanBook_deletedAt_idx" ON "HumanBook"("deletedAt");

-- CreateIndex
CREATE INDEX "HumanBook_regionId_idx" ON "HumanBook"("regionId");

-- AddForeignKey
ALTER TABLE "HumanBook" ADD CONSTRAINT "HumanBook_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanBook" ADD CONSTRAINT "HumanBook_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

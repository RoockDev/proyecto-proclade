-- CreateEnum
CREATE TYPE "SuperheroStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateTable
CREATE TABLE "Superhero" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quote" TEXT,
    "country" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "SuperheroStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Superhero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Superhero_slug_key" ON "Superhero"("slug");

-- AddForeignKey
ALTER TABLE "Superhero" ADD CONSTRAINT "Superhero_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

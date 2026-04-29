-- AddColumn
ALTER TABLE "User" ADD COLUMN "realHeroSuperheroId" INTEGER;

-- AddConstraint
ALTER TABLE "User"
  ADD CONSTRAINT "User_realHeroSuperheroId_fkey"
  FOREIGN KEY ("realHeroSuperheroId") REFERENCES "Superhero"("id") ON DELETE SET NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_realHeroSuperheroId_key" ON "User" ("realHeroSuperheroId");

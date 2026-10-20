-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "game_players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" DATE,
    "gender" TEXT NOT NULL DEFAULT 'f',
    "mate" TEXT NOT NULL DEFAULT 'estrela',
    "grade" TEXT NOT NULL DEFAULT '1',
    "code" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "items" JSONB NOT NULL DEFAULT '[]',
    "wear" JSONB NOT NULL DEFAULT '{}',
    "familyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_families" (
    "id" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "gemsPerCoin" INTEGER NOT NULL DEFAULT 100,
    "coinCents" INTEGER NOT NULL DEFAULT 5000,
    "dailyGemLimit" INTEGER NOT NULL DEFAULT 30,
    "failedPins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_lessons" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "stars" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "reviews" INTEGER NOT NULL DEFAULT 0,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "gems" INTEGER NOT NULL DEFAULT 0,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_exchanges" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gems" INTEGER NOT NULL,
    "coins" INTEGER NOT NULL,
    "cents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_exchanges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_players_code_key" ON "game_players"("code");

-- CreateIndex
CREATE INDEX "game_players_stars_idx" ON "game_players"("stars");

-- CreateIndex
CREATE INDEX "game_players_familyId_idx" ON "game_players"("familyId");

-- CreateIndex
CREATE INDEX "game_lessons_playerId_day_idx" ON "game_lessons"("playerId", "day");

-- CreateIndex
CREATE INDEX "game_exchanges_playerId_status_idx" ON "game_exchanges"("playerId", "status");

-- AddForeignKey
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "game_families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_lessons" ADD CONSTRAINT "game_lessons_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "game_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_exchanges" ADD CONSTRAINT "game_exchanges_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "game_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;


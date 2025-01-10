-- CreateTable
CREATE TABLE "AnonymousUsage" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonymousUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousUsage_identifier_key" ON "AnonymousUsage"("identifier");

-- CreateIndex
CREATE INDEX "AnonymousUsage_identifier_idx" ON "AnonymousUsage"("identifier");

-- CreateIndex
CREATE INDEX "AnonymousUsage_lastMessage_idx" ON "AnonymousUsage"("lastMessage");

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "messageCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MessageUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageUsage_userId_month_year_key" ON "MessageUsage"("userId", "month", "year");

-- AddForeignKey
ALTER TABLE "MessageUsage" ADD CONSTRAINT "MessageUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `cryptoId` on the `AlertHistory` table. All the data in the column will be lost.
  - You are about to drop the column `newPrice` on the `AlertHistory` table. All the data in the column will be lost.
  - You are about to drop the column `oldPrice` on the `AlertHistory` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `AlertHistory` table. All the data in the column will be lost.
  - Added the required column `price` to the `AlertHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AlertHistory_alertId_idx";

-- DropIndex
DROP INDEX "AlertHistory_userId_idx";

-- AlterTable
ALTER TABLE "AlertHistory" DROP COLUMN "cryptoId",
DROP COLUMN "newPrice",
DROP COLUMN "oldPrice",
DROP COLUMN "percentage",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "AlertHistory_alertId_userId_idx" ON "AlertHistory"("alertId", "userId");

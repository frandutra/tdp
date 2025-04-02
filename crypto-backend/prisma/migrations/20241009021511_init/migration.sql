/*
  Warnings:

  - You are about to drop the column `cryptoId` on the `Cryptocurrency` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cryptocurrency_cryptoId_key";

-- AlterTable
ALTER TABLE "Cryptocurrency" DROP COLUMN "cryptoId";

/*
  Warnings:

  - A unique constraint covering the columns `[cryptoId]` on the table `Cryptocurrency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cryptoId` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cryptocurrency" ADD COLUMN     "cryptoId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cryptocurrency_cryptoId_key" ON "Cryptocurrency"("cryptoId");

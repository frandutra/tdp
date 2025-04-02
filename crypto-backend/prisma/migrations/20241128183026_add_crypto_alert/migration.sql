/*
  Warnings:

  - The primary key for the `Cryptocurrency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id,userId]` on the table `Cryptocurrency` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cryptocurrency" DROP CONSTRAINT "Cryptocurrency_pkey",
ADD CONSTRAINT "Cryptocurrency_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "CryptoAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cryptoId" TEXT NOT NULL,
    "thresholdPercentage" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CryptoAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cryptocurrency_id_userId_key" ON "Cryptocurrency"("id", "userId");

-- AddForeignKey
ALTER TABLE "CryptoAlert" ADD CONSTRAINT "CryptoAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoAlert" ADD CONSTRAINT "CryptoAlert_cryptoId_userId_fkey" FOREIGN KEY ("cryptoId", "userId") REFERENCES "Cryptocurrency"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

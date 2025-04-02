/*
  Warnings:

  - The primary key for the `Cryptocurrency` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Cryptocurrency" DROP CONSTRAINT "Cryptocurrency_pkey",
ADD CONSTRAINT "Cryptocurrency_pkey" PRIMARY KEY ("id", "userId");

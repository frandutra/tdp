-- DropForeignKey
ALTER TABLE "AlertHistory" DROP CONSTRAINT "AlertHistory_alertId_fkey";

-- AddForeignKey
ALTER TABLE "AlertHistory" ADD CONSTRAINT "AlertHistory_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "CryptoAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

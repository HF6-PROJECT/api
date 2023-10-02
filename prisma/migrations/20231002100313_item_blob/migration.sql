/*
  Warnings:

  - You are about to drop the column `blobUrl` on the `Item` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Item_blobUrl_idx";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "blobUrl";

-- CreateTable
CREATE TABLE "ItemBlob" (
    "id" SERIAL NOT NULL,
    "blobUrl" VARCHAR(1024) NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "ItemBlob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemBlob_itemId_key" ON "ItemBlob"("itemId");

-- AddForeignKey
ALTER TABLE "ItemBlob" ADD CONSTRAINT "ItemBlob_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

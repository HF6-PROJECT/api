-- DropForeignKey
ALTER TABLE "ItemBlob" DROP CONSTRAINT "ItemBlob_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSharing" DROP CONSTRAINT "ItemSharing_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSharing" DROP CONSTRAINT "ItemSharing_userId_fkey";

-- CreateTable
CREATE TABLE "ItemFolder" (
    "id" SERIAL NOT NULL,
    "color" VARCHAR(255) NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "ItemFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemFolder_itemId_key" ON "ItemFolder"("itemId");

-- AddForeignKey
ALTER TABLE "ItemFolder" ADD CONSTRAINT "ItemFolder_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemBlob" ADD CONSTRAINT "ItemBlob_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSharing" ADD CONSTRAINT "ItemSharing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSharing" ADD CONSTRAINT "ItemSharing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

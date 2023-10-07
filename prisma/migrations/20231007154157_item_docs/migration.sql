-- CreateTable
CREATE TABLE "ItemDocs" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "ItemDocs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemDocs_itemId_key" ON "ItemDocs"("itemId");

-- AddForeignKey
ALTER TABLE "ItemDocs" ADD CONSTRAINT "ItemDocs_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

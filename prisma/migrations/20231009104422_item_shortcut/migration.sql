-- CreateTable
CREATE TABLE "ItemShortcut" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "linkedItemId" INTEGER NOT NULL,

    CONSTRAINT "ItemShortcut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemShortcut_itemId_key" ON "ItemShortcut"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemShortcut_linkedItemId_key" ON "ItemShortcut"("linkedItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemShortcut_itemId_linkedItemId_key" ON "ItemShortcut"("itemId", "linkedItemId");

-- AddForeignKey
ALTER TABLE "ItemShortcut" ADD CONSTRAINT "ItemShortcut_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemShortcut" ADD CONSTRAINT "ItemShortcut_linkedItemId_fkey" FOREIGN KEY ("linkedItemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

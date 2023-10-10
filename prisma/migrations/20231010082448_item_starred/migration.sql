-- CreateTable
CREATE TABLE "ItemStarred" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ItemStarred_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemStarred_itemId_idx" ON "ItemStarred"("itemId");

-- CreateIndex
CREATE INDEX "ItemStarred_userId_idx" ON "ItemStarred"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemStarred_itemId_userId_key" ON "ItemStarred"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "ItemStarred" ADD CONSTRAINT "ItemStarred_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemStarred" ADD CONSTRAINT "ItemStarred_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

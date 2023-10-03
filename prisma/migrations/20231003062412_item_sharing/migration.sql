-- CreateTable
CREATE TABLE "ItemSharing" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemSharing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemSharing_itemId_idx" ON "ItemSharing"("itemId");

-- CreateIndex
CREATE INDEX "ItemSharing_userId_idx" ON "ItemSharing"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemSharing_itemId_userId_key" ON "ItemSharing"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "ItemSharing" ADD CONSTRAINT "ItemSharing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSharing" ADD CONSTRAINT "ItemSharing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

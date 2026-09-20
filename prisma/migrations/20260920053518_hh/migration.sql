-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeSessionId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCents" INTEGER NOT NULL,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "couponCode" TEXT,
    "shippingMethod" TEXT NOT NULL DEFAULT 'standard',
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "giftWrap" BOOLEAN NOT NULL DEFAULT false,
    "shippingName" TEXT,
    "shippingLine1" TEXT,
    "shippingLine2" TEXT,
    "shippingCity" TEXT,
    "shippingPostal" TEXT,
    "shippingCountry" TEXT,
    "gaClientId" TEXT,
    "gaPurchaseSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Order" ("couponCode", "createdAt", "customerEmail", "discountCents", "giftWrap", "id", "shippingCents", "shippingCity", "shippingCountry", "shippingLine1", "shippingLine2", "shippingMethod", "shippingName", "shippingPostal", "status", "stripeSessionId", "totalCents") SELECT "couponCode", "createdAt", "customerEmail", "discountCents", "giftWrap", "id", "shippingCents", "shippingCity", "shippingCountry", "shippingLine1", "shippingLine2", "shippingMethod", "shippingName", "shippingPostal", "status", "stripeSessionId", "totalCents" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'draft', 'inactive', 'archived');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "discountPrice" DECIMAL(12,2),
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "weightGram" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");


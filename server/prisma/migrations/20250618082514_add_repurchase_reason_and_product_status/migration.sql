/*
  Warnings:

  - You are about to alter the column `status` on the `tb_product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `tb_product` MODIFY `status` ENUM('AVAILABLE', 'SOLD', 'REPURCHASED', 'DAMAGED') NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE `tb_repurchase` ADD COLUMN `Re_Reason` TEXT NULL;

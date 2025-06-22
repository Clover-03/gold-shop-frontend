/*
  Warnings:

  - You are about to drop the column `Gold_Change_Fee` on the `tb_exchange` table. All the data in the column will be lost.
  - You are about to drop the column `Lost_Weight_Fee` on the `tb_exchange` table. All the data in the column will be lost.
  - You are about to drop the column `Img` on the `tb_product` table. All the data in the column will be lost.
  - You are about to drop the column `Lost_Weight_Fee` on the `tb_repurchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_exchange` DROP COLUMN `Gold_Change_Fee`,
    DROP COLUMN `Lost_Weight_Fee`,
    ADD COLUMN `Exchange_Fee` DECIMAL(10, 2) NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `tb_product` DROP COLUMN `Img`;

-- AlterTable
ALTER TABLE `tb_repurchase` DROP COLUMN `Lost_Weight_Fee`,
    ADD COLUMN `Loose_Gold_Cost` DECIMAL(10, 2) NULL DEFAULT 0.00;

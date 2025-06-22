/*
  Warnings:

  - You are about to drop the column `Loose_Gold_Cost` on the `tb_repurchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_repurchase` DROP COLUMN `Loose_Gold_Cost`,
    ADD COLUMN `Lost_Weight_Fee` DECIMAL(10, 2) NULL DEFAULT 0.00;

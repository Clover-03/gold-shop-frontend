/*
  Warnings:

  - You are about to drop the column `Exchange_Fee` on the `tb_exchange` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_exchange` DROP COLUMN `Exchange_Fee`,
    ADD COLUMN `Gold_Change_Fee` DECIMAL(10, 2) NULL DEFAULT 0,
    ADD COLUMN `Lost_Weight_Fee` DECIMAL(10, 2) NULL DEFAULT 0;

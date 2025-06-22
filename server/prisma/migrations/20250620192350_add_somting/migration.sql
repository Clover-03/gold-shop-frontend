/*
  Warnings:

  - You are about to drop the column `Making_charge` on the `tb_product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_product` DROP COLUMN `Making_charge`,
    ADD COLUMN `Pattern_value` DECIMAL(10, 2) NULL;

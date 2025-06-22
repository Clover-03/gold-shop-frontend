/*
  Warnings:

  - You are about to drop the column `Pattern_value` on the `tb_product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `tb_product` DROP COLUMN `Pattern_value`,
    ADD COLUMN `Making_charge` DECIMAL(10, 2) NULL;

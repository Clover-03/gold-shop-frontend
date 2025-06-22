/*
  Warnings:

  - You are about to drop the column `Price_offered` on the `tb_repurchase` table. All the data in the column will be lost.
  - Added the required column `Repurchase_Price` to the `tb_repurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_repurchase` CHANGE COLUMN `Price_offered` `Repurchase_Price` DECIMAL(10, 2) NOT NULL;

/*
  Warnings:

  - Made the column `Order_ID` on table `tb_order_product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Pd_ID` on table `tb_order_product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Buy_price` on table `tb_order_product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `tb_order_product` DROP FOREIGN KEY `tb_order_product_Order_ID_fkey`;

-- DropForeignKey
ALTER TABLE `tb_order_product` DROP FOREIGN KEY `tb_order_product_Pd_ID_fkey`;

-- DropIndex
DROP INDEX `tb_order_product_Order_ID_fkey` ON `tb_order_product`;

-- DropIndex
DROP INDEX `tb_order_product_Pd_ID_fkey` ON `tb_order_product`;

-- AlterTable
ALTER TABLE `tb_order_product` ADD COLUMN `Discount` DECIMAL(10, 2) NULL DEFAULT 0.00,
    MODIFY `Order_ID` INTEGER NOT NULL,
    MODIFY `Pd_ID` VARCHAR(10) NOT NULL,
    MODIFY `Buy_price` DECIMAL(10, 2) NOT NULL;

-- AddForeignKey
ALTER TABLE `tb_order_product` ADD CONSTRAINT `tb_order_product_Order_ID_fkey` FOREIGN KEY (`Order_ID`) REFERENCES `tb_order`(`Order_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_order_product` ADD CONSTRAINT `tb_order_product_Pd_ID_fkey` FOREIGN KEY (`Pd_ID`) REFERENCES `tb_product`(`Pd_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

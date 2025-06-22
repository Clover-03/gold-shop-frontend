/*
  Warnings:

  - The values [ส่งแล้ว,ລໍຖ້າສົ່ງ,ຍົກເລີກ] on the enum `tb_invoice_Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `Status` on the `tb_order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `tb_invoice` MODIFY `Status` ENUM('Pending', 'Completed', 'Cancelled') NULL;

-- AlterTable
ALTER TABLE `tb_order` MODIFY `Status` ENUM('Pending', 'Completed', 'Cancelled') NULL;

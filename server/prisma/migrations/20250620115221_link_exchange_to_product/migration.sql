/*
  Warnings:

  - You are about to drop the column `Old_Pd_Actual_Weight` on the `tb_exchange` table. All the data in the column will be lost.
  - You are about to drop the column `Old_Pd_Description` on the `tb_exchange` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Old_Pd_ID]` on the table `tb_exchange` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `tb_exchange` DROP COLUMN `Old_Pd_Actual_Weight`,
    DROP COLUMN `Old_Pd_Description`,
    ADD COLUMN `Old_Pd_ID` VARCHAR(10) NULL;

-- AlterTable
ALTER TABLE `tb_product` MODIFY `status` ENUM('AVAILABLE', 'SOLD', 'REPURCHASED', 'DAMAGED', 'EXCHANGED') NOT NULL DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE UNIQUE INDEX `tb_exchange_Old_Pd_ID_key` ON `tb_exchange`(`Old_Pd_ID`);

-- AddForeignKey
ALTER TABLE `tb_exchange` ADD CONSTRAINT `tb_exchange_Old_Pd_ID_fkey` FOREIGN KEY (`Old_Pd_ID`) REFERENCES `tb_product`(`Pd_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

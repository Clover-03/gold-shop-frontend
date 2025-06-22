-- AlterTable
ALTER TABLE `tb_repurchase` ADD COLUMN `Damage_Cost` DECIMAL(10, 2) NULL DEFAULT 0.00,
    ADD COLUMN `Loose_Gold_Cost` DECIMAL(10, 2) NULL DEFAULT 0.00;

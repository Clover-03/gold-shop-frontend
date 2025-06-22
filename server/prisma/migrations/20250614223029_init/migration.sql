-- CreateTable
CREATE TABLE `tb_price` (
    `Price_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Buy_price` DECIMAL(10, 2) NULL,
    `Sell_price` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`Price_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_product` (
    `Pd_ID` VARCHAR(10) NOT NULL,
    `Price_ID` INTEGER NULL,
    `Order_ID` INTEGER NULL,
    `Inv_ID` INTEGER NULL,
    `Re_ID` INTEGER NULL,
    `Pd_name` VARCHAR(50) NOT NULL,
    `Type` VARCHAR(30) NULL,
    `Weight` VARCHAR(50) NULL,
    `Pattern_value` DECIMAL(10, 2) NULL,
    `Img` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',

    PRIMARY KEY (`Pd_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_customer` (
    `Cust_ID` VARCHAR(10) NOT NULL,
    `Cust_name` VARCHAR(100) NOT NULL,
    `Phone` VARCHAR(15) NULL,
    `Address` TEXT NULL,

    PRIMARY KEY (`Cust_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_user` (
    `User_ID` VARCHAR(10) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `Role` ENUM('admin', 'user') NULL,

    UNIQUE INDEX `tb_user_username_key`(`username`),
    PRIMARY KEY (`User_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_supplier` (
    `Sup_ID` VARCHAR(10) NOT NULL,
    `Sup_name` VARCHAR(100) NOT NULL,
    `Phone` VARCHAR(15) NULL,
    `Address` TEXT NULL,

    PRIMARY KEY (`Sup_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_order` (
    `Order_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Sup_ID` VARCHAR(10) NULL,
    `Order_Date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Status` VARCHAR(191) NULL,

    PRIMARY KEY (`Order_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_order_product` (
    `Order_Product_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Order_ID` INTEGER NULL,
    `Pd_ID` VARCHAR(10) NULL,
    `Quantity` INTEGER NOT NULL,
    `Buy_price` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`Order_Product_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_invoice` (
    `Inv_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Order_ID` INTEGER NULL,
    `Inv_Date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Total_Price` DECIMAL(15, 2) NULL,
    `Status` ENUM('ส่งแล้ว', 'ລໍຖ້າສົ່ງ', 'ຍົກເລີກ') NULL,

    PRIMARY KEY (`Inv_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_sell` (
    `Sell_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Pd_ID` VARCHAR(10) NOT NULL,
    `Cust_ID` VARCHAR(10) NULL,
    `User_ID` VARCHAR(10) NULL,
    `Sell_Date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Quantity` INTEGER NOT NULL,
    `Price_At_Sale` DECIMAL(20, 2) NOT NULL,
    `Total` DECIMAL(20, 2) NULL,

    UNIQUE INDEX `tb_sell_Pd_ID_key`(`Pd_ID`),
    PRIMARY KEY (`Sell_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_repurchase` (
    `Re_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Cust_ID` VARCHAR(10) NULL,
    `User_ID` VARCHAR(10) NULL,
    `Re_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Price_offered` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`Re_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tb_exchange` (
    `Exch_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Cust_ID` VARCHAR(10) NULL,
    `Old_Pd_Description` TEXT NOT NULL,
    `New_Pd_ID` VARCHAR(10) NULL,
    `Exch_Date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Old_Pd_Actual_Weight` DECIMAL(65, 30) NULL,
    `Old_Product_Value` DECIMAL(10, 2) NULL,
    `New_Product_Value` DECIMAL(10, 2) NULL,
    `Exchange_Fee` DECIMAL(10, 2) NULL DEFAULT 0,
    `Different_price` DECIMAL(10, 2) NULL,
    `Notes` TEXT NULL,

    PRIMARY KEY (`Exch_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tb_product` ADD CONSTRAINT `tb_product_Price_ID_fkey` FOREIGN KEY (`Price_ID`) REFERENCES `tb_price`(`Price_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_product` ADD CONSTRAINT `tb_product_Order_ID_fkey` FOREIGN KEY (`Order_ID`) REFERENCES `tb_order`(`Order_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_product` ADD CONSTRAINT `tb_product_Inv_ID_fkey` FOREIGN KEY (`Inv_ID`) REFERENCES `tb_invoice`(`Inv_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_product` ADD CONSTRAINT `tb_product_Re_ID_fkey` FOREIGN KEY (`Re_ID`) REFERENCES `tb_repurchase`(`Re_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_order` ADD CONSTRAINT `tb_order_Sup_ID_fkey` FOREIGN KEY (`Sup_ID`) REFERENCES `tb_supplier`(`Sup_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_order_product` ADD CONSTRAINT `tb_order_product_Order_ID_fkey` FOREIGN KEY (`Order_ID`) REFERENCES `tb_order`(`Order_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_order_product` ADD CONSTRAINT `tb_order_product_Pd_ID_fkey` FOREIGN KEY (`Pd_ID`) REFERENCES `tb_product`(`Pd_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_invoice` ADD CONSTRAINT `tb_invoice_Order_ID_fkey` FOREIGN KEY (`Order_ID`) REFERENCES `tb_order`(`Order_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_sell` ADD CONSTRAINT `tb_sell_Pd_ID_fkey` FOREIGN KEY (`Pd_ID`) REFERENCES `tb_product`(`Pd_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_sell` ADD CONSTRAINT `tb_sell_Cust_ID_fkey` FOREIGN KEY (`Cust_ID`) REFERENCES `tb_customer`(`Cust_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_sell` ADD CONSTRAINT `tb_sell_User_ID_fkey` FOREIGN KEY (`User_ID`) REFERENCES `tb_user`(`User_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_repurchase` ADD CONSTRAINT `tb_repurchase_Cust_ID_fkey` FOREIGN KEY (`Cust_ID`) REFERENCES `tb_customer`(`Cust_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_repurchase` ADD CONSTRAINT `tb_repurchase_User_ID_fkey` FOREIGN KEY (`User_ID`) REFERENCES `tb_user`(`User_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_exchange` ADD CONSTRAINT `tb_exchange_Cust_ID_fkey` FOREIGN KEY (`Cust_ID`) REFERENCES `tb_customer`(`Cust_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tb_exchange` ADD CONSTRAINT `tb_exchange_New_Pd_ID_fkey` FOREIGN KEY (`New_Pd_ID`) REFERENCES `tb_product`(`Pd_ID`) ON DELETE SET NULL ON UPDATE CASCADE;

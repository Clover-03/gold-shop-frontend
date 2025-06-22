-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS gold_shop_db;
USE gold_shop_db;

-- สร้างตารางข้อมูลราคาทอง
CREATE TABLE Tb_Price (
    Price_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Buy_price DECIMAL(10,2),
    Sell_price DECIMAL(10,2)
);

-- สร้างตารางข้อมูลสินค้า
CREATE TABLE Tb_Product (
    Pd_ID VARCHAR(10) PRIMARY KEY,
    Price_ID INT(10),
    Order_ID INT(10),
    Inv_ID INT(10),
    Re_ID INT(10),
    Pd_name VARCHAR(50) NOT NULL,
    Type VARCHAR(30),
    Weight ENUM('0.25 ບາດ', '0.5 ບາດ', '1 ບາດ', '2 ບາດ', '3 ບາດ', '5 ບາດ', '10 ບາດ'),
    Pattern_value DECIMAL(10,2),
    FOREIGN KEY (Price_ID) REFERENCES Tb_Price(Price_ID),
    FOREIGN KEY (Order_ID) REFERENCES Tb_Order(Order_ID),
    FOREIGN KEY (Inv_ID) REFERENCES Tb_Invoice(Inv_ID),
    FOREIGN KEY (Re_ID) REFERENCES Tb_Repurchase(Re_ID)
);

-- สร้างตารางข้อมูลลูกค้า
CREATE TABLE Tb_Customer (
    Cust_ID VARCHAR(10) PRIMARY KEY,
    Cust_name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    Address TEXT
);

-- สร้างตารางข้อมูลผู้ใช้งาน
CREATE TABLE Tb_User (
    User_ID VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(30) NOT NULL,
    Role ENUM('admin', 'user') NOT NULL
);

-- สร้างตารางข้อมูลผู้จำหน่าย
CREATE TABLE Tb_Supplier (
    Sup_ID VARCHAR(10) PRIMARY KEY,
    Sup_name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    Address TEXT
);

-- สร้างตารางข้อมูลการสั่งซื้อ
CREATE TABLE Tb_Order (
    Order_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Sup_ID VARCHAR(10),
    Order_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Sup_ID) REFERENCES Tb_Supplier(Sup_ID)
);

-- สร้างตารางข้อมูลสินค้าในการสั่งซื้อ (1:M)
CREATE TABLE Tb_Order_Product (
    Order_Product_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Order_ID INT(10),
    Pd_ID VARCHAR(10),
    Quantity INT NOT NULL,
    Buy_price DECIMAL(10,2),  -- เพิ่มฟิลด์เก็บราคาซื้อ ณ เวลาที่สั่งซื้อ
    FOREIGN KEY (Order_ID) REFERENCES Tb_Order(Order_ID),
    FOREIGN KEY (Pd_ID) REFERENCES Tb_Product(Pd_ID)
);

-- สร้างตารางข้อมูลใบส่งสินค้า
CREATE TABLE Tb_Invoice (
    Inv_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Order_ID INT(10),
    Inv_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Total_Price DECIMAL(15,2),
    Status ENUM('ສົ່ງແລ້ວ', 'ລໍຖ້າສົ່ງ', 'ຍົກເລີກ') NOT NULL,
    FOREIGN KEY (Order_ID) REFERENCES Tb_Order(Order_ID)
);

-- สร้างตารางข้อมูลการขายสินค้า (1:1 กับ Product)
CREATE TABLE Tb_Sell (
    Sell_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Pd_ID VARCHAR(10) UNIQUE,
    Cust_ID VARCHAR(10),
    User_ID VARCHAR(10),
    Sell_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Quantity INT NOT NULL,
    Price_At_Sale DECIMAL(10,2) NOT NULL,  -- ราคาขาย ณ เวลาที่ขาย
    Total DECIMAL(15,2),
    FOREIGN KEY (Pd_ID) REFERENCES Tb_Product(Pd_ID),
    FOREIGN KEY (Cust_ID) REFERENCES Tb_Customer(Cust_ID),
    FOREIGN KEY (User_ID) REFERENCES Tb_User(User_ID)
);

-- สร้างตารางข้อมูลการรับซื้อคืน
CREATE TABLE Tb_Repurchase (
    Re_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Cust_ID VARCHAR(10),
    Re_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Price_offered DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Cust_ID) REFERENCES Tb_Customer(Cust_ID)
);

-- สร้างตารางข้อมูลการแลกเปลี่ยนสินค้า
CREATE TABLE Tb_Exchange (
    Exch_ID INT(10) PRIMARY KEY AUTO_INCREMENT,
    Pd_ID VARCHAR(10),
    Cust_ID VARCHAR(10),
    Exch_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    Different_price DECIMAL(10,2),
    FOREIGN KEY (Pd_ID) REFERENCES Tb_Product(Pd_ID),
    FOREIGN KEY (Cust_ID) REFERENCES Tb_Customer(Cust_ID)
);

-- สร้าง View สำหรับดึงราคาล่าสุด
CREATE VIEW Latest_Price AS
SELECT * FROM Tb_Price 
WHERE Date = (SELECT MAX(Date) FROM Tb_Price);

-- สร้าง Trigger สำหรับอัพเดทราคาซื้อในตาราง Order_Product
DELIMITER //
CREATE TRIGGER Set_Order_Buy_Price
BEFORE INSERT ON Tb_Order_Product
FOR EACH ROW
BEGIN
    DECLARE current_buy_price DECIMAL(10,2);
    
    -- ดึงราคาซื้อล่าสุดจาก Tb_Price
    SELECT Buy_price INTO current_buy_price
    FROM Tb_Price
    WHERE Date = (SELECT MAX(Date) FROM Tb_Price);
    
    -- กำหนดราคาซื้อให้กับรายการสั่งซื้อ
    SET NEW.Buy_price = current_buy_price;
END//

-- สร้าง Trigger สำหรับอัพเดทราคาขายในตาราง Sell
CREATE TRIGGER Set_Sell_Price
BEFORE INSERT ON Tb_Sell
FOR EACH ROW
BEGIN
    DECLARE current_sell_price DECIMAL(10,2);
    
    -- ดึงราคาขายล่าสุดจาก Tb_Price
    SELECT Sell_price INTO current_sell_price
    FROM Tb_Price
    WHERE Date = (SELECT MAX(Date) FROM Tb_Price);
    
    -- กำหนดราคาขาย ณ เวลาที่ขาย
    SET NEW.Price_At_Sale = current_sell_price;
    -- คำนวณยอดรวม
    SET NEW.Total = NEW.Quantity * current_sell_price;
END//
DELIMITER ;


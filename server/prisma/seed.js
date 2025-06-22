const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed User
  const user = await prisma.tb_User.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      User_ID: 'U001',
      username: 'admin',
      Password: await bcrypt.hash('123456', 10),
      Role: 'admin',
    },
  });
  console.log(`Created user: ${user.username}`);

  // 2. Seed Supplier
  const supplier1 = await prisma.tb_Supplier.upsert({
    where: { Sup_ID: 'S001' },
    update: {},
    create: {
      Sup_ID: 'S001',
      Sup_name: 'ຮ້ານຄຳພູວົງ',
      Phone: '2055551111',
      Address: 'ນະຄອນຫຼວງວຽງຈັນ',
    },
  });
   const supplier2 = await prisma.tb_Supplier.upsert({
    where: { Sup_ID: 'S002' },
    update: {},
    create: {
      Sup_ID: 'S002',
      Sup_name: 'ຮ້ານຄຳສິລິ',
      Phone: '2055552222',
      Address: 'ປາກເຊ',
    },
  });
  console.log(`Created suppliers: ${supplier1.Sup_name}, ${supplier2.Sup_name}`);

  // Add 9 more suppliers
  const suppliersToAdd = [
    { Sup_ID: 'S003', Sup_name: 'ຮ້ານຄຳຈະເລີນ', Phone: '2055553333', Address: 'ບ້ານ ທົ່ງກາງ, ເມືອງ ສີໂຄດຕະບອງ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Sup_ID: 'S004', Sup_name: 'ບໍລິສັດ ຄຳລາວ ຈຳກັດ', Phone: '2055554444', Address: 'ບ້ານ ໂພນສະຫວ່າງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Sup_ID: 'S005', Sup_name: 'ກຸ່ມຊ່າງຄຳຫຼວງພະບາງ', Phone: '2055555555', Address: 'ບ້ານ ວັດໜອງ, ເມືອງ ຫຼວງພະບາງ, ແຂວງ ຫຼວງພະບາງ' },
    { Sup_ID: 'S006', Sup_name: 'ຮ້ານຄຳແສງແກ້ວ', Phone: '2055556666', Address: 'ບ້ານ ປາກເຊ, ເມືອງ ປາກເຊ, ແຂວງ ຈຳປາສັກ' },
    { Sup_ID: 'S007', Sup_name: 'ຮ້ານຄຳໄຊຍະພູມ', Phone: '2055557777', Address: 'ບ້ານ ໄຊຍະພູມ, ເມືອງ ໄກສອນ ພົມວິຫານ, ແຂວງ ສະຫວັນນະເຂດ' },
    { Sup_ID: 'S008', Sup_name: 'ຮ້ານຄຳອຸດົມໄຊ', Phone: '2055558888', Address: 'ບ້ານ ນາເລົາ, ເມືອງ ໄຊ, ແຂວງ ອຸດົມໄຊ' },
    { Sup_ID: 'S009', Sup_name: 'ຮ້ານຄຳສາຍນ້ຳຂອງ', Phone: '2055559999', Address: 'ບ້ານ ຫ້ວຍຊາຍ, ເມືອງ ຫ້ວຍຊາຍ, ແຂວງ ບໍ່ແກ້ວ' },
    { Sup_ID: 'S010', Sup_name: 'ກຸ່ມຜະລິດຄຳບໍລິຄຳໄຊ', Phone: '2055551010', Address: 'ບ້ານ ປາກຊັນ, ເມືອງ ປາກຊັນ, ແຂວງ ບໍລິຄຳໄຊ' },
    { Sup_ID: 'S011', Sup_name: 'ຮ້ານຄຳພູນຊັບ', Phone: '2055551212', Address: 'ບ້ານ ໂພນໄຊ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ' },
  ];

  for (const supData of suppliersToAdd) {
    await prisma.tb_Supplier.upsert({
      where: { Sup_ID: supData.Sup_ID },
      update: {},
      create: supData,
    });
  }
  console.log('Added 9 more suppliers.');

  // 3. Seed Customer
  const customer1 = await prisma.tb_Customer.upsert({
    where: { Cust_ID: 'C001' },
    update: {},
    create: {
      Cust_ID: 'C001',
      Cust_name: 'ທ້າວ ສົມຊາຍ ໃຈດີ',
      Phone: '2099887766',
      Address: 'ບ້ານ ໂພນໄຊ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ',
    },
  });
  console.log(`Created customer: ${customer1.Cust_name}`);

  // Add 9 more customers
  const customersToAdd = [
    { Cust_ID: 'C002', Cust_name: 'ນາງ ຄຳແພງ ມະณีວົງ', Phone: '2099887767', Address: 'ບ້ານ ໜອງບອນ, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Cust_ID: 'C003', Cust_name: 'ທ້າວ ສຸກສະຫວັນ ແກ້ວມณี', Phone: '2099887768', Address: 'ບ້ານ ດົງໂດກ, ເມືອງ ຫາດຊາຍຟອງ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Cust_ID: 'C004', Cust_name: 'ນາງ ປານີ ພົມມະຈັນ', Phone: '2099887769', Address: 'ບ້ານ ໂພນຕ້ອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Cust_ID: 'C005', Cust_name: 'ທ້າວ ບຸນທັນ ສີຫາລາດ', Phone: '2099887770', Address: 'ບ້ານ ວັດໄຕ, ເມືອງ ສີໂຄດຕະບອງ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Cust_ID: 'C006', Cust_name: 'ນາງ ພອນສະຫວັນ ໄຊຍະເສນ', Phone: '2099887771', Address: 'ບ້ານ ໂນນສະຫວ່າງ, ເມືອງ ປາກເຊ, ແຂວງ ຈຳປາສັກ' },
    { Cust_ID: 'C007', Cust_name: 'ທ້າວ ເພັດສະໝອນ ອິນທະວົງ', Phone: '2099887772', Address: 'ບ້ານ ໂພນສະອາດ, ເມືອງ ຫຼວງພະບາງ, ແຂວງ ຫຼວງພະບາງ' },
    { Cust_ID: 'C008', Cust_name: 'ນາງ ດາວວອນ ວໍລະຈິດ', Phone: '2099887773', Address: 'ບ້ານ ໂພນໄຮ, ເມືອງ ໄກສອນ ພົມວິຫານ, ແຂວງ ສະຫວັນນະເຂດ' },
    { Cust_ID: 'C009', Cust_name: 'ທ້າວ ຄຳສອນ ສຸວັນນະເມທີ', Phone: '2099887774', Address: 'ບ້ານ ທ່າເດື່ອ, ເມືອງ ຫາດຊາຍຟອງ, ນະຄອນຫຼວງວຽງຈັນ' },
    { Cust_ID: 'C010', Cust_name: 'ນາງ ມະລິວັນ ຈັນທະວົງ', Phone: '2099887775', Address: 'ບ້ານ ສີເມືອງ, ເມືອງ ຈັນທະບູລີ, ນະຄອນຫຼວງວຽງຈັນ' },
  ];

  for (const custData of customersToAdd) {
    await prisma.tb_Customer.upsert({
      where: { Cust_ID: custData.Cust_ID },
      update: {},
      create: custData,
    });
  }
  console.log('Added 9 more customers.');

  // 4. Seed Price
  const price = await prisma.tb_Price.create({
    data: {
      Buy_price: 4500000,
      Sell_price: 4650000,
    },
  });
  console.log(`Created price record with ID: ${price.Price_ID}`);

  // 5. Seed Products
  const productsToAdd = [
    { Pd_ID: "P001", Pd_name: "ສາຍຄໍທອງຄຳ", Type: "ສາຍຄໍ", Weight: "15.16", Pattern_value: 50000 },
    { Pd_ID: "P002", Pd_name: "ແຫວນທອງຄຳ", Type: "ແຫວນ", Weight: "7.58", Pattern_value: 30000 },
    { Pd_ID: "P003", Pd_name: "ກຳໄລທອງຄຳ", Type: "ກຳໄລ", Weight: "15.16", Pattern_value: 60000 },
    { Pd_ID: "P004", Pd_name: "ຕ່າງຫູທອງຄຳ", Type: "ຕ່າງຫູ", Weight: "3.79", Pattern_value: 25000 },
    { Pd_ID: "P005", Pd_name: "ສ້ອຍຄໍ 2 ບາດ", Type: "ສາຍຄໍ", Weight: "30.32", Pattern_value: 90000 },
    { Pd_ID: "P006", Pd_name: "ສາຍແຂນລາຍกระดูกงู", Type: "ສາຍແຂນ", Weight: "15.16", Pattern_value: 75000 },
    { Pd_ID: "P007", Pd_name: "ແຫວນນາມສະກຸນ", Type: "ແຫວນ", Weight: "7.58", Pattern_value: 45000 },
    { Pd_ID: "P008", Pd_name: "ຈີ້ຮູບຫົວໃຈ", Type: "ຈີ້", Weight: "3.79", Pattern_value: 30000 },
    { Pd_ID: "P009", Pd_name: "ສ້ອຍຄໍ 5 ບາດ", Type: "ສາຍຄໍ", Weight: "75.8", Pattern_value: 150000 },
    { Pd_ID: "P010", Pd_name: "ກຳໄລຂໍ້ມືເດັກນ້ອຍ", Type: "ກຳໄລ", Weight: "3.79", Pattern_value: 20000 },
    { Pd_ID: "P011", Pd_name: "ແຫວນດອກພິກຸນ", Type: "ແຫວນ", Weight: "3.79", Pattern_value: 35000 },
    { Pd_ID: "P012", Pd_name: "ຕ່າງຫູແບບຫ່ວງ", Type: "ຕ່າງຫູ", Weight: "7.58", Pattern_value: 40000 },
    { Pd_ID: "P013", Pd_name: "ສາຍແຂນນ້ຳໜັກ 2 ບາດ", Type: "ສາຍແຂນ", Weight: "30.32", Pattern_value: 110000 },
    { Pd_ID: "P014", Pd_name: "ຈີ້ຮູບດາວ", Type: "ຈີ້", Weight: "1.9", Pattern_value: 15000 },
  ];

  for (const productData of productsToAdd) {
    const product = await prisma.tb_Product.upsert({
      where: { Pd_ID: productData.Pd_ID },
      update: {
        ...productData,
        Price_ID: price.Price_ID, // Ensure it's always linked to the created price
      },
      create: {
        ...productData,
        Price_ID: price.Price_ID, // Link to the newly created price
      },
    });
    console.log(`Created or updated product: ${product.Pd_name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
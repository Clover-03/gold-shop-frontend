const { PrismaClient, ProductStatus } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all repurchases
exports.getAllRepurchases = async (req, res) => {
  try {
    const repurchases = await prisma.tb_Repurchase.findMany({
      include: {
        Tb_Customer: true,
        Tb_User: true,
        Tb_Product: true,
      },
    });
    res.json(repurchases);
  } catch (error) {
    console.error("Error in getAllRepurchases:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

// Get repurchase by ID
exports.getRepurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const repurchase = await prisma.tb_Repurchase.findUnique({
      where: { Re_ID: parseInt(id) },
      include: {
        Tb_Customer: true,
        Tb_User: true,
        Tb_Product: true,
      },
    });
    if (!repurchase) {
      return res.status(404).json({ error: 'Repurchase not found' });
    }
    res.json(repurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new repurchase
exports.createRepurchase = async (req, res) => {
  const { custId, productIds, repurchasePrice, reReason, type, newCustomer, newProduct, damageCost, lostWeightFee } = req.body;
  const userId = req.user?.userId; // Get user ID from the authenticated user (from middleware)

  // Ensure monetary values are parsed as numbers and default to 0 if invalid
  const parsedRepurchasePrice = parseFloat(repurchasePrice) || 0;
  const parsedDamageCost = parseFloat(damageCost) || 0;
  const parsedLostWeightFee = parseFloat(lostWeightFee) || 0;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const newRepurchase = await prisma.$transaction(async (prisma) => {
      let customerIdToUse = custId;
      let productsToRepurchaseIds = productIds;

      if (type === 'newGold') {
        // Handle new customer or existing customer for new gold repurchase
        if (newCustomer && !newCustomer.id) {
          if (!newCustomer.name || !newCustomer.phone) {
            throw new Error('New customer name and phone are required for new gold repurchase.');
          }
          const createdCustomer = await prisma.tb_Customer.create({
            data: {
              Cust_Name: newCustomer.name,
              Cust_Phone: newCustomer.phone,
              Cust_Address: newCustomer.address,
            },
          });
          customerIdToUse = createdCustomer.Cust_ID;
        } else if (newCustomer && newCustomer.id) {
          customerIdToUse = newCustomer.id;
        } else {
          throw new Error('Customer information is required for new gold repurchase.');
        }

        // Create new product for new gold repurchase
        if (!newProduct || !newProduct.Pd_ID || !newProduct.Pd_Name || !newProduct.Type_ID || !newProduct.Weight) {
          throw new Error('New product ID, Name, Type, and Weight are required for new gold repurchase.');
        }
        const createdProduct = await prisma.tb_Product.create({
          data: {
            Pd_ID: newProduct.Pd_ID,
            Pd_Name: newProduct.Pd_Name,
            Type_ID: newProduct.Type_ID,
            Weight: newProduct.Weight,
            Pattern_Value: newProduct.Pattern_Value || 0,
            status: ProductStatus.REPURCHASED, // Set status to REPURCHASED for new gold
          },
        });
        productsToRepurchaseIds = [createdProduct.Pd_ID];
      }

      // 1. Create the repurchase record
      const repurchase = await prisma.tb_Repurchase.create({
        data: {
          Cust_ID: customerIdToUse,
          User_ID: userId,
          Repurchase_Price: parsedRepurchasePrice,
          Re_Reason: reReason,
          Damage_Cost: parsedDamageCost,
          Lost_Weight_Fee: parsedLostWeightFee,
          Net_Repurchase_Price: parsedRepurchasePrice - parsedDamageCost - parsedLostWeightFee, // Calculate net repurchase price
          // Connect products to repurchase (if any)
          Tb_Product: {
            connect: productsToRepurchaseIds.map(id => ({ Pd_ID: id }))
          }
        },
      });

      // 2. Update the products status if they are existing products
      if (type === 'existingProduct') {
          await prisma.tb_Product.updateMany({
              where: {
                  Pd_ID: { in: productsToRepurchaseIds },
              },
              data: {
                  Re_ID: repurchase.Re_ID, // Link to the repurchase record
                  status: ProductStatus.REPURCHASED, // Set status to REPURCHASED
              },
          });
      } else if (type === 'newGold') {
           // For new gold, the product was already created and linked with status REPURCHASED
           // Just link the repurchase ID to the newly created product
           await prisma.tb_Product.updateMany({
                where: {
                    Pd_ID: { in: productsToRepurchaseIds }, // This will contain the single new product ID
                },
                data: {
                    Re_ID: repurchase.Re_ID,
                },
           });
      }

      return repurchase;
    });

    res.status(201).json(newRepurchase);
  } catch (error) {
    console.error("Error in createRepurchase:", error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
};

// Update a repurchase
exports.updateRepurchase = async (req, res) => {
        const { id } = req.params;
  const { productIds, repurchasePrice } = req.body;
  const repurchaseId = parseInt(id);

  try {
    const updatedRepurchase = await prisma.$transaction(async (prisma) => {
      // 1. Update the price on the repurchase record
      const repurchase = await prisma.tb_Repurchase.update({
        where: { Re_ID: repurchaseId },
        data: {
          Repurchase_Price: repurchasePrice,
        },
      });

      // 2. Get the list of products currently associated with this repurchase
      const currentProducts = await prisma.tb_Product.findMany({
        where: { Re_ID: repurchaseId },
        select: { Pd_ID: true },
      });
      const currentProductIds = currentProducts.map(p => p.Pd_ID);

      // Ensure productIds is always an array and filter invalid values
      let safeProductIds = Array.isArray(productIds) ? productIds : [];
      safeProductIds = safeProductIds.filter(pid => pid != null && pid !== '');

      // 3. Detach products that are no longer in the list
      const productsToDetach = currentProductIds.filter(pid => !safeProductIds.includes(pid));
      if (productsToDetach.length > 0) {
        await prisma.tb_Product.updateMany({
          where: { Pd_ID: { in: productsToDetach } },
          data: { Re_ID: null },
        });
      }

      // 4. Attach new products to this repurchase
      const productsToAttach = safeProductIds.filter(pid => !currentProductIds.includes(pid));
      if (productsToAttach.length > 0) {
        await prisma.tb_Product.updateMany({
          where: { Pd_ID: { in: productsToAttach } },
          data: { Re_ID: repurchaseId },
        });
      }

      return repurchase;
    });

        res.json(updatedRepurchase);
    } catch (error) {
        console.error("Error in updateRepurchase:", error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

// Delete a repurchase
exports.deleteRepurchase = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (prisma) => {
            const repurchaseId = parseInt(id);

            // 1. Find products associated with this repurchase
            const associatedProducts = await prisma.tb_Product.findMany({
                where: { Re_ID: repurchaseId },
                select: { Pd_ID: true },
            });

            // 2. Clear the repurchase ID and set status to AVAILABLE from associated products
            await prisma.tb_Product.updateMany({
                where: { Re_ID: repurchaseId },
                data: {
                    Re_ID: null,
                    status: ProductStatus.AVAILABLE, // Set status to AVAILABLE
                },
            });

            // 3. Delete the repurchase record
            await prisma.tb_Repurchase.delete({
                where: { Re_ID: repurchaseId },
            });
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error in deleteRepurchase:", error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
}; 
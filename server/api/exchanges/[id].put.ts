import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const exchangeId = Number(event.context.params?.id);
    if (!exchangeId || isNaN(exchangeId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid exchange ID',
        });
    }

    try {
        const body = await readBody(event);
        const {
            Cust_ID,
            New_Pd_ID,
            Exch_Date,
            Old_Product_Value,
            New_Product_Value,
            Gold_Change_Fee,
            Lost_Weight_Fee,
            Different_price,
            Notes,
            // Old product fields from form
            Old_Pd_ID,
            Old_Pd_Description,
            Old_Pd_Type,
            Old_Pd_Actual_Weight,
        } = body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the main exchange record
            const exchange = await tx.tb_Exchange.update({
                where: { Exch_ID: exchangeId },
                data: {
                    Cust_ID,
                    New_Pd_ID,
                    Exch_Date: Exch_Date ? new Date(Exch_Date) : undefined,
                    Old_Product_Value,
                    New_Product_Value,
                    Gold_Change_Fee,
                    Lost_Weight_Fee,
                    Different_price,
                    Notes,
                },
            });

            // 2. Update the associated "old product" that was taken in
            if (Old_Pd_ID) {
                 await tx.tb_Product.update({
                    where: { Pd_ID: Old_Pd_ID },
                    data: {
                        Pd_name: Old_Pd_Description,
                        Type: Old_Pd_Type,
                        Weight: String(Old_Pd_Actual_Weight),
                    }
                });
            } else {
                // This case should ideally not happen if data is consistent
                console.warn(`Attempted to update exchange #${exchangeId} without a valid Old_Pd_ID.`);
            }

            return exchange;
        });

        return result;
    } catch (error) {
        console.error(`Error updating exchange ${exchangeId}:`, error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update exchange',
        });
    }
}); 
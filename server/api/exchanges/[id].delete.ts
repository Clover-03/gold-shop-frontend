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
        await prisma.tb_Exchange.delete({
            where: { Exch_ID: exchangeId },
        });
        return { message: 'Exchange deleted successfully' };
    } catch (error) {
        console.error(`Error deleting exchange ${exchangeId}:`, error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete exchange',
        });
    }
}); 
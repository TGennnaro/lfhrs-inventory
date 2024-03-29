import { log } from '@lib/log';
import { db } from '@lib/prisma';
import { catchError } from '@lib/utils';
import { notify } from '@lib/utils-server';
import { LogType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
	items: z.array(
		z.object({
			id: z.string().cuid(),
			quantity: z.number().int().positive(),
		})
	),
});

export async function POST(req: Request) {
	const session = await getServerSession();
	// if (!session) return new NextResponse('Unauthorized', { status: 401 });
	const data = await req.json();
	try {
		const { items } = schema.parse(data);
		for (const item of items) {
			const dbItem = await db.item.findUnique({ where: { id: item.id } });
			if (!dbItem) throw new Error('Item not found');
			if (dbItem.quantity < item.quantity)
				throw new Error('Requested quantity exceeds stored quantity');
			if (dbItem.quantity === item.quantity)
				await db.item.delete({ where: { id: item.id } });
			else
				await db.item.update({
					where: { id: item.id },
					data: { quantity: dbItem.quantity - item.quantity },
				});
		}
		const product = await db.product.findUnique({
			where: { id: data.productId },
			include: {
				location: true,
				items: true,
			},
		});
		if (
			product &&
			product?.items.reduce((acc, item) => acc + item.quantity, 0) <
				product?.min
		) {
			notify({
				userId: product?.location.userId!,
				message: `${product?.name} is low on stock.`,
				redirect: `/app/${product?.location.id}/${product?.id}`,
			});
		}
		log(LogType.ITEM_CHECKOUT, {
			product: data.productId,
			quantity: items.reduce((acc, item) => acc + item.quantity, 0),
		});
		return new NextResponse('Checkout recorded.', { status: 200 });
	} catch (e) {
		return catchError(e);
	}
}

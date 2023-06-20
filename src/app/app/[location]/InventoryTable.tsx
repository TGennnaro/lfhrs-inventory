import { Item, Product } from '@prisma/client';
import { isExpiring } from '@lib/date';
import { db } from '@lib/prisma';
import { Tag } from '@lib/enum';
import Products from './Products';

async function getData(location: string) {
	const data = await db.product.findMany({
		include: {
			location: true,
			items: true,
		},
		where: {
			locationId: location,
		},
	});
	const extended: ProductInfo[] = data.map(
		(product: Product & { items: Item[] }) => {
			const quantity = product.items.reduce(
				(acc: number, item: Item) =>
					!item.onOrder ? acc + item.quantity : acc,
				0
			);
			const exp = product.items.reduce(
				(acc: Date | string, item: Item) =>
					item.expires !== null && (new Date(item.expires) < acc || acc === '')
						? new Date(item.expires)
						: acc,
				''
			);
			const hasOnOrder = product.items.some((item) => item.onOrder);
			const tags = [];
			if (quantity < product.min) tags.push(Tag.LOW);
			if (isExpiring(exp) && quantity > 0) tags.push(Tag.EXPIRES);
			if (hasOnOrder) tags.push(Tag.ONORDER);
			return {
				quantity,
				exp,
				tags,
				...product,
			};
		}
	);
	// console.dir(extended, { depth: Infinity });

	return extended;
}

export default async function InventoryTable({ id }: { id: string }) {
	const data = await getData(id);
	// await new Promise((res, rej) => setTimeout(res, 5000));
	return <Products data={data} />;
}
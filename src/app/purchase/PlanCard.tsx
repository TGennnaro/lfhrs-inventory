import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Check, X } from 'lucide-react';

function Perk({
	included = false,
	children,
}: {
	included?: boolean;
	children: React.ReactNode;
}) {
	return (
		<li className='flex items-center gap-2 py-2 text-sm font-light border-b last-of-type:border-none'>
			{included ? (
				<Check className='w-4 h-4 text-blue-700' />
			) : (
				<X className='w-4 h-4 text-red-700' />
			)}
			{children}
		</li>
	);
}

interface Props {
	name: string;
	monthly: number;
	price: number;
	perks: Record<string, boolean>;
}

export default function PlanCard({ name, monthly, price, perks }: Props) {
	const canBuy = name !== 'Free';
	const bestValue = name === 'Executive';
	return (
		<div
			className={`flex flex-col gap-4 p-8 border shadow-md w-80 shrink-0 rounded-2xl bg-zinc-50 h-fit ${
				bestValue ? 'border-blue-700' : ''
			}`}
		>
			<div className='flex flex-col gap-1'>
				<div className='flex justify-between'>
					<span className='font-semibold'>{name}</span>
					{name === 'Executive' && <Badge>Best value</Badge>}
				</div>
				<div className='flex items-center gap-2'>
					<span className='text-4xl font-bold'>${monthly}</span>
					<div className='flex flex-col text-xs'>
						<span>USD</span>
						<span className='text-muted'>Billed monthly</span>
					</div>
				</div>
				<span className='font-medium'>
					+ ${price}
					<span className='text-sm font-normal text-muted'>
						{' '}
						USD billed once
					</span>
				</span>
			</div>
			<Button disabled={!canBuy}>
				{canBuy ? 'Buy this plan' : 'You have this'}
			</Button>
			<ul>
				{Object.entries(perks).map(([name, included]) => (
					<Perk key={name} included={included}>
						{name}
					</Perk>
				))}
			</ul>
		</div>
	);
}
'use client';

import { cn } from '@lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ className }: { className?: string }) {
	const { theme } = useTheme();
	return (
		<Link href='/' className={cn('items-center gap-2 flex', className)}>
			<Image
				src={theme === 'light' ? '/logo.svg' : '/logo-dark.svg'}
				alt='logo'
				width={32}
				height={32}
			/>
			<span className='text-2xl font-semibold text-[#111] dark:text-[#eee]'>
				Pulsate
			</span>
		</Link>
	);
}

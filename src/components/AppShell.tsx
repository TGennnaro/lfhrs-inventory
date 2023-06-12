'use client';

import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import SiteHeader from './SiteHeader';
import { useState } from 'react';

export default function AppShell({
	locations,
	children,
}: {
	locations: LocationInfo[] | null;
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	return (
		<div className='flex h-screen'>
			<Sidebar
				locations={locations}
				open={sidebarOpen}
				toggle={setSidebarOpen}
			/>
			<div className='flex flex-col w-full shrink'>
				<SiteHeader sidebarToggle={setSidebarOpen} sidebarOpen={sidebarOpen} />
				<div className='w-full h-full overflow-y-scroll p-4'>{children}</div>
			</div>
		</div>
	);
}

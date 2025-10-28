"use client"

import { MenuBar } from '../components/menu-bar';
import { PlaidLink } from '../components/plaid-link';

export default function LandingPage() {
	return (
		<>
			<MenuBar />
			<section
				className="flex flex-col items-center h-screen bg-cover bg-center"
				style={{ backgroundImage: "url(/background.png)" }}
			>
				<h1 className="text-7xl sm:text-8xl tracking-tight leading-[1.08] font-spectral font-normal">
					Money Talks,
				</h1>
				<h1 className="text-7xl sm:text-8xl tracking-tight leading-[1.08] font-spectral font-normal mt-2">
					Dough Listens
				</h1>
				<div>
					<PlaidLink />
				</div>
			</section>
		</>
	)
}

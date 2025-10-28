"use client"

import { MenuBar } from '../components/menu-bar';
import { PlaidLink } from '../components/plaid-link';

export default function LandingPage() {
	return (
		<>
			<MenuBar />
			<section
				className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
				style={{ backgroundImage: "url(/background.png)" }}
			>
				<h1 className="text-9xl sm:text-9xl tracking-tight font-spectral font-normal">
					Money Talks,
				</h1>
				<h1 className="text-9xl sm:text-9xl tracking-tight font-spectral font-normal mt-2">
					Dough Listens
				</h1>
				<div>
					<PlaidLink />
				</div>
			</section>
		</>
	)
}

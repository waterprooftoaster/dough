"use client"
import { MenuBar } from '../components/menu-bar';
import { PlaidLink } from '../components/plaid-link';

export default function LandingPage() {
	return (
		<>
			<MenuBar />
			<section
				className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
			>
				<h1 className="text-5xl sm:text-6xl font-spectral font-medium">
					Money Talks,
				</h1>
				<h1 className="text-5xl sm:text-6xl font-spectral font-medium">
					Dough Listens
				</h1>
				<div>
					<PlaidLink />
				</div>
			</section>
		</>
	)
}

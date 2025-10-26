"use client"
import { MenuBar } from '../components/menu-bar';
import { PlaidLink } from '../components/plaid-link';

export default function LandingPage() {
	return (
		<>
			<MenuBar />
			<section className="w-full">
				<div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
					<div className="grid items-center gap-10 lg:grid-cols-2">
						{/* Left: Headline + CTA */}
						<div className="max-w-xl">
							<h1 className="text-5xl font-semibold tracking-tight leading-[1.05] text-zinc-900 sm:text-6xl">
								Money talks,
							</h1>
							<h1 className="text-5xl font-semibold tracking-tight leading-[1.05] text-zinc-900 sm:text-6xl">
								Dough Listens.
							</h1>
							<div className="mt-8">
								<PlaidLink />
							</div>
						</div>

						{/* Right: Image placeholder */}
						<div className="relative">
							<div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
								{/* Replace the src with your actual asset when ready */}
								<img
									src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'><rect width='100%' height='100%' fill='%23f6f6f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28' fill='%23999'>image placeholder</text></svg>"
									alt="Product preview"
									className="h-full w-full object-cover"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}

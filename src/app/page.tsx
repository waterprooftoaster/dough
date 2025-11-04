"use client"

import { Header } from '../components/header';
import { PlaidLink } from '../components/plaid-link';
import { MacbookScroll } from '@/src/components/ui/macbook-scroll';

export default function LandingPage() {
	return (
		<>
			<Header />
			<section>
				<div className="bg-background scale-110 sm:scale-60 md:scale-100 py-80">
					<MacbookScroll
						src={`/1750867581345.jpg`}
						showGradient={true}
					/>
				</div>
				<div>
					<PlaidLink />
				</div>
			</section>
			<section className="min-h-[200vh] bg-transparent">
				test section
			</section>
		</>
	);
}

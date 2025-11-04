"use client"

import { Header } from '../components/header';
import { PlaidLink } from '../components/plaid-link';
import { MacbookScroll } from '@/src/components/ui/macbook-scroll';

export default function LandingPage() {
	return (
		<>
			<Header />
			<section>
				<div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
					<MacbookScroll
						title={
							<span>
								This Macbook is built with Tailwindcss. <br /> No kidding.
							</span>
						}
						src={`/1750867581345.jpg`}
						showGradient={false}
					/>
				</div>
				<div>
					<PlaidLink />
				</div>
			</section>
		</>
	);
}

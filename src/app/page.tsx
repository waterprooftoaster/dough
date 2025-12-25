"use client"

import { Header } from '../components/header';
import { MacbookScroll } from '@/src/components/ui/macbook-scroll';

export default function Hero() {
	return (
		<>
			<Header />
			<section>
				<div className="bg-background scale-115 sm:scale-60 md:scale-100 pt-40">
					<MacbookScroll
						src={`/Screenshot1.png`}
						showGradient={true}
					/>
				</div>
			</section>

			<section>
				<div className="bg-white">

				</div>
			</section>
		</>


	);
}

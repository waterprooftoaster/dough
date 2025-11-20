"use client"


import { useRef } from 'react';
import { Header } from '../components/header';
import { MacbookScroll } from '@/src/components/ui/macbook-scroll';

import { PlaidLink, PlaidLinkHandle } from '../lib/plaid-link';


export default function Hero() {
	const linkRef = useRef<PlaidLinkHandle>(null);

	return (
		<>
			<Header />
			<section>
				<div className="bg-background scale-115 sm:scale-60 md:scale-100 pt-40">
					<MacbookScroll
						src={`/1750867581345.jpg`}
						showGradient={true}
					/>
				</div>
				<div className="pr-10">
					<PlaidLink ref={linkRef} />
					<button
						onClick={() => linkRef.current?.open()}
						disabled={!linkRef.current?.ready}
						className={`
							px-4 py-2 rounded-md text-white
							${linkRef.current?.ready ? 'bg-background' : 'bg-gray-500 opacity-60'}`
						}
					>
						Connect bank
					</button>
				</div>
			</section>
		</>
	);
}

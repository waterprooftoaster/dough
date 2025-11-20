"use client"


// import { useRef } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '../components/header';
import { MacbookScroll } from '@/src/components/ui/macbook-scroll';

import {
	usePlaidLink,
	PlaidLinkOnExit,
	PlaidLinkOnExitMetadata,
	PlaidLinkError,
} from "react-plaid-link";

// import { PlaidLink, PlaidLinkHandle } from '../lib/plaid-link';

export default function Hero() {
	/* const [linkToken, setLinkToken] = useState<string | null>(null);

	const getToken = useCallback(
		async () => {
			try {
				const response = await fetch("/api/plaid/create-link-token", { method: "POST", });
				if (!response.ok) throw new Error("Failed to create link token");
				const { link_token } = await response.json();
				setLinkToken(link_token);
			} catch (error) {
				console.error("Error getting link token:", error);
			}
		}, []
	);

	const onSuccess = useCallback(
		async (public_token: string) => {
			try {
				const response = await fetch("/api/plaid/create-plaid-item", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ public_token }),
				});
				if (!response.ok) throw new Error("Failed to exchange token");
			} catch (error) {
				console.error("Error linking account:");
			}
		}, []
	);

	const onExit = useCallback<PlaidLinkOnExit>(
		(error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
			if (error != null && error.error_code === 'INVALID_LINK_TOKEN') { getToken(); }
			// to handle other error codes, see https://plaid.com/docs/errors/
			console.log("User exited Plaid Link flow", { error, metadata });
		}, [getToken]
	);

	const { open, ready } = usePlaidLink({
		token: linkToken,
		onSuccess,
		onExit
	});

	// Get link token
	useEffect(() => {
		if (!linkToken) { getToken(); }
	}, [linkToken, getToken]);
 */
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
				{/* <div className="pr-10">
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
				</div> */}

			</section>
			<div className="flex space-x-3 items-center">
				{/* <button
					onClick={() => open()}
					disabled={!ready}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					Connect Bank
				</button> */}
			</div>
		</>
	);
}

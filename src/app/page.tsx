"use client"

import React, { useCallback, useEffect, useState } from 'react';
import {
	usePlaidLink,
	PlaidLinkOnExit,
	PlaidLinkOnExitMetadata,
	PlaidLinkError,
} from "react-plaid-link";
import { MenuBar } from '../components/menu-bar';

//to do list:
// 3. a dashboard component to show the accounts
// 4. a credit card suggestor page

export default function LandingPage() {
	const [linkToken, setLinkToken] = useState<string | null>(null);

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

	return (
		<div className="min-h-screen">

			{/* Menu Bar */}
			<MenuBar />

			{/* Main landing content */}
			<main className="flex flex-col items-center justify-left flex-1 px-4 py-12 text-left">
				<h1 className="text-5xl font-bold mb-4"> Money Talks, </h1>
				<h1 className="text-5xl font-bold mb-4"> Dough Listens. </h1>
				<div className="flex space-x-3 items-center">
					<button
						onClick={() => open()}
						disabled={!ready}
						className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50 transition-colors"
					>
						Connect Bank
					</button>
				</div>
			</main>
		</div>

	)
}

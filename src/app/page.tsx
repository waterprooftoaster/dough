"use client"

import React, { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from "react-plaid-link";
import { MenuBar } from '../components/menu-bar';

export default function LandingPage() {
	const [linkToken, setLinkToken] = useState<string | null>(null);

	useEffect(() => {
		const getToken = async () => {
			try {
				const response = await fetch("/api/plaid/create-link-token", {
					method: "POST",
				});
				if (!response.ok) throw new Error("Failed to create link token");
				const { link_token } = await response.json();
				setLinkToken(link_token);
			} catch (error) {
				console.error("Error getting link token:", error);
			}
		};

		if (!linkToken) {
			// link token always null on first render
			getToken();
		}
	}, [linkToken]);

const onSuccess = React.useCallback(
		async (public_token: string) => {
			try {
				const response = await fetch("/api/plaid/exchange-token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ public_token }),
				});

				if (!response.ok) throw new Error("Failed to exchange token");
			} catch (error) {
				console.error("Error linking account:", error);
			}
		},
	[]);

	const { open, ready } = usePlaidLink({
		token: linkToken,
		onSuccess,
	});

	return (
		<div className="min-h-screen bg-gray-50">
			
			{/* Menu Bar */}
			<MenuBar />

			{/* Main landing content */}
			<main className="flex flex-col items-center justify-left flex-1 px-4 py-12 text-left">
				<h1 className="text-5xl font-bold mb-4"> Money Talks, </h1>
				<h1 className="text-5xl font-bold mb-4"> Dough Listens. </h1>
				<button
					onClick={() => open()}
					disabled={!ready}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					Connect Bank
					</button>
			</main>
		</div>
	)
}

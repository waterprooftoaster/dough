"use client"

import React, { useCallback, useEffect, useState } from 'react';
import {usePlaidLink,   
				PlaidLinkOnExit,
				PlaidLinkOnExitMetadata,
				PlaidLinkError, 
				} from "react-plaid-link";
import { MenuBar } from '../components/menu-bar';

//to do list:
// update transactions on accounts
// update-institutions should be called on every render
// 1. it deletes duplicating accounts across items, delete the older one
// 2. it updates the accounts(transactions, mask, etc)
// 3. a dashboard component to show the accounts
// 4. a credit card suggestor page

export default function LandingPage() {
	const [linkToken, setLinkToken] = useState<string | null>(null);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [syncing, setSyncing] = useState(false);
	const [loading, setLoading] = useState(false);

	const getToken = useCallback(async () => {
		try {
			const response = await fetch("/api/plaid/create-link-token", {method: "POST",});
			if (!response.ok) throw new Error("Failed to create link token");
			const { link_token } = await response.json();
			setLinkToken(link_token);
		} catch (error) {
			console.error("Error getting link token:", error);
		}
	}, []);

	useEffect(() => {
		if (!linkToken) {
			// link token always null on first render
			getToken();
		}
	}, [linkToken, getToken]);

	// On mount: trigger a full transactions sync for all items, then load transactions
	useEffect(() => {
		let mounted = true;
		async function syncAndLoad() {
			setSyncing(true);
			try {
				// Trigger server-side sync for all items (no institution_id)
				await fetch('/api/plaid/download-transactions', { method: 'POST' });
			} catch (err) {
				console.warn('Sync request failed', err);
			} finally {
				setSyncing(false);
			}
			// Load transactions to display
			setLoading(true);
			try {
				const res = await fetch('/api/transactions');
				if (!res.ok) throw new Error(`${res.status}`);
				const data = await res.json();
				if (!mounted) return;
				setTransactions(data.transactions || []);
			} catch (err) {
				console.error('Failed to load transactions', err);
			} finally { setLoading(false); }
		}
		syncAndLoad();
		return () => { mounted = false };
	}, []);

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
		},
		[]);
	
	const onExit = useCallback<PlaidLinkOnExit>(
		(error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
			if (error != null && error.error_code === 'INVALID_LINK_TOKEN') {
				getToken();
			}
			// to handle other error codes, see https://plaid.com/docs/errors/
			console.log("User exited Plaid Link flow", { error, metadata });
		},
	[getToken]);

	const { open, ready } = usePlaidLink({
		token: linkToken,
		onSuccess,
		onExit
	});

	return (
		<div className="min-h-screen bg-gray-50">
			
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
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						Connect Bank
					</button>
					<div className="text-sm text-gray-600">{syncing ? 'Syncing transactions...' : 'Transactions synced'}</div>
				</div>

				{/* Transactions table */}
				<div className="w-full mt-6">
					{loading ? (
						<div>Loading transactions...</div>
					) : (
						<table className="min-w-full bg-white border">
							<thead>
								<tr className="bg-gray-100">
									<th className="px-4 py-2 text-left">Date</th>
									<th className="px-4 py-2 text-left">Name</th>
									<th className="px-4 py-2 text-right">Amount</th>
									<th className="px-4 py-2 text-left">Account</th>
									<th className="px-4 py-2 text-left">Category</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map((t) => (
									<tr key={t.id} className="border-t">
										<td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
										<td className="px-4 py-2">{t.name}</td>
										<td className="px-4 py-2 text-right">{t.amount}</td>
										<td className="px-4 py-2">{t.accountId}</td>
										<td className="px-4 py-2">{t.category}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</main>
		</div>
	)
}

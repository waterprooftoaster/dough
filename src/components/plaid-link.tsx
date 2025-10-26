"use client"

import {
  useCallback,
  useEffect,
  useState
} from 'react';
import {
  usePlaidLink,
  PlaidLinkOnExit,
  PlaidLinkOnExitMetadata,
  PlaidLinkError,
} from "react-plaid-link";

export function plaidLink() {
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
    <button
      onClick={() => open()}
      disabled={!ready}
      className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50 transition-colors"
    >
      Connect
    </button>
  )
}
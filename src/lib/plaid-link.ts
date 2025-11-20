import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  usePlaidLink,
  PlaidLinkOnExit,
  PlaidLinkOnExitMetadata,
  PlaidLinkError
} from "react-plaid-link";

export interface PlaidLinkHandle {
  open: Function;
  ready: boolean;
}

export const PlaidLink = forwardRef<PlaidLinkHandle>((dummy, ref) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const getToken = useCallback(
    async () => {
      try {
        const response = await fetch("/api/plaid/create-link-token", { method: "POST", });
        if (!response.ok) throw new Error("Failed to create link token");
        const { link_token } = await response.json();
        setLinkToken(link_token);
      }
      catch (error) {
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
      }
      catch (error) {
        console.error("Error linking account:", error);
      }
    }, []
  );

  const onExit = useCallback<PlaidLinkOnExit>(
    (error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
      if (error != null && error.error_code === 'INVALID_LINK_TOKEN') { getToken(); }
      console.log("User exited Plaid Link flow", { error, metadata });
    }, [getToken]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit
  });

  useImperativeHandle(ref, () => ({
    open,
    ready
  }));;

  useEffect(() => {
    if (!linkToken) { getToken(); }
  }, [linkToken, getToken]);

  if (!ready) {
    console.warn('plaidlink not ready')
  }
  return null;
});

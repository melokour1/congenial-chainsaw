import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextValue {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({ isConnected: true });

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}

/**
 * Tracks real device connectivity (not just "did our last fetch fail") so the
 * app can show one clear "you're offline" banner instead of a driver tapping
 * a dead button repeatedly and wondering why nothing happens. Defaults to
 * connected until the first real reading arrives, so it never flashes an
 * offline banner on a fast, healthy connection.
 */
export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isInternetReachable is null until NetInfo has actually probed connectivity;
      // fall back to isConnected (link-layer state) in that window rather than
      // treating "unknown" as "offline".
      setIsConnected(state.isInternetReachable ?? state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  return <NetworkContext.Provider value={{ isConnected }}>{children}</NetworkContext.Provider>;
}

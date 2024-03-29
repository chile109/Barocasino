import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, optimism } from 'wagmi/chains'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';

const { connectors } = getDefaultWallets({
    appName: 'RainbowKit App',
    projectId: '05a2d754adbce301a6b2fcdac522f088',
  });


export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, optimism],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimism.id]: http(),
  },
})
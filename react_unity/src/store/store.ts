import { createPublicClient, custom, http, createWalletClient } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'

export const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  })
  
export const walletClient = createWalletClient({
    chain: sepolia,
    transport:  custom(window.ethereum)
})
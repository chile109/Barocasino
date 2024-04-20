import { createPublicClient, custom, http, createWalletClient } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

export const client = createPublicClient({
    chain: sepolia,
    transport: http()
  })
  
export const walletClient = createWalletClient({
    chain: sepolia,
    transport:  custom(window.ethereum)
})

interface UserPointStore {
  userPoints: string;
  setUserPoints: (newValue: string) => void;
}

const userPointStore = create<UserPointStore>(
  // Add the persist middleware with the storage engine
  persist(
    (set) => ({
      userPoints: '0',
      setUserPoints: (newValue: string) => set({ userPoints: newValue }),
    }),
    { name: 'userPointStore' },
  ) as any,
);


// const userPointStore = create<UserPointStore>((set) => ({
//   userPoints: '0',
//   setUserPoints: (newValue: string) => set({ userPoints: newValue }),
// }));


export { userPointStore };
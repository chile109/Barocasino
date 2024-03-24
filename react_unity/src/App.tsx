//import React from "react";
import { UnityContext } from "react-unity-webgl";
import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { bacaratAddress } from '../src/assets/definitions/constants/bacarat'
import BacaratAddress from '../src/assets/definitions/abi/barcarat.json'
import { nftAddress } from '../src/assets/definitions/constants/NFT'
import NFTAddress from '../src/assets/definitions/abi/NFT.json'
import { createPublicClient, http } from 'viem';
import { optimism } from 'viem/chains';
import EnterPage from './components/enterPage'
import 'bootstrap/dist/css/bootstrap.min.css';

export const publicClient = createPublicClient({
  chain: optimism,
  transport: http(
    'https://opt-mainnet.g.alchemy.com/v2/Vu6asWumE3Ozc3vkSRy7Uya0q-G5NLYR'
  )
})

const App = () => {
  const [user, setUser] = useState('Check User');
  const [userPoint, setUserPoint] = useState(0)
  const [betResult, setBetResult] = useState({
    result: 'Lose',
    earn: '0',
  })
  const [betMoney, setBetMoney] = useState({playerWin: 100, backerWin: 0, Tie: 0, playerPair:0, bankerPair:0})
  const [loginAddress, setLoginAddress] = useState('')

  const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Create a signer to interact with the contract
  const signer = provider.getSigner();

  // Get the address of the signer
  signer.getAddress().then(address => {
    console.log('Logged-in address:', address);
    setLoginAddress(address)
  }).catch(error => {
    console.error('Error getting address:', error);
  });

    const contractBacarat = new ethers.Contract(
      bacaratAddress,
      BacaratAddress,
      signer,
    );
    
    const readUserInfo = async() => {
      const user = await contractBacarat.players(loginAddress)
      setUserPoint(user.toString())
    }

  const enterGame = async () => {

    const contractNFT = new ethers.Contract(
      nftAddress,
      NFTAddress,
      signer,
    );
      
    try{
      const checkBal = await contractNFT.balanceOf('0x7FE76e93398fFa540c5de59f2F517c1406F469eA', 0)
      
      // check user NFT == 1
      // check NFT transfer to host
      // add player

      // check user NFT == 1
      // check NFT 
      if(checkBal.toNumber() > 0){
        const checkApproval = await contractNFT.isApprovedForAll('0x7FE76e93398fFa540c5de59f2F517c1406F469eA', '0x36eE7E01Db601e2454430F86480734fa1Aaca172')
        if(!checkApproval){
          await contractNFT.setApprovalForAll('0x36eE7E01Db601e2454430F86480734fa1Aaca172', true)

          // Call the addPlayer function to add a new player
          const tx = await contractBacarat.addPlayer({ gasLimit: 500000 });
          await tx.wait(); // Wait for the transaction to be mined
        }
      }

      const user = await contractBacarat.players('0x7FE76e93398fFa540c5de59f2F517c1406F469eA')
      setUserPoint(user.toString())
      setUser('Successfully join in')
    }catch(err){
      setUser('User Already in')
      console.log('err', err)
    }    
  }

  const betUser = async () => {
    const result = await contractBacarat.bet(betMoney.Tie, betMoney.backerWin, betMoney.bankerPair, betMoney.playerPair, betMoney.playerWin);
    const receipt = await result.wait();

    const logs = await publicClient.getLogs({
      address: '0xf65c50Ddb43d2Cd009ac17Bbe501E5A20caec5e6',
      event: {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "bettor",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "playerWin",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "backerWin",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "Tie",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "playerPair",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "bankerPair",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "winAmount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "enum Baccarat.PairOutcome",
            name: "pairOutcome",
            type: "uint8",
          },
          {
            indexed: false,
            internalType: "enum Baccarat.GameOutcome",
            name: "gameOutcome",
            type: "uint8",
          },
        ],
        name: "BetResult",
        type: "event",
      },
      // args: {
      //   from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      //   to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
      // },
      fromBlock: BigInt(117808743),
      toBlock: "latest",

    });

    let betTotalMoney = betMoney.Tie + betMoney.backerWin + betMoney.bankerPair + betMoney.playerPair + betMoney.playerWin

    let results = logs[logs.length-1] 
    let resultMoney = results?.args?.winAmount?.toString()

    if (results?.args?.winAmount?.toString() === '0') {
      setBetResult({
        result: 'Lose',
        earn: `${betTotalMoney}`,
      })
    }else{
      setBetResult({
        result: 'Win',
        earn: resultMoney ? resultMoney : '0',
      })
    }

    readUserInfo()
  }

  useEffect(() => {
    enterGame()
  }, [loginAddress])

  return (
    <>
    <EnterPage />
    <div>
      <div>
        <button onClick={readUserInfo}>Read Info</button>
        <button onClick={betUser}>Bet</button>
      </div>
      <div>
        <p>{user} {userPoint}</p>
        <p>{betResult.result} {betResult.earn}</p>
      </div>
    </div>
    </>
  );
};

export default App;

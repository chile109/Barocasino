//import React from "react";
import { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { bacaratAddress } from '../src/assets/definitions/constants/bacarat'
import BacaratAddress from '../src/assets/definitions/abi/barcarat.json'
import { nftAddress } from '../src/assets/definitions/constants/NFT'
import NFTAddress from '../src/assets/definitions/abi/NFT.json'
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import {
  generateBaccaratResult,
  GameResult
} from './utils/baccarat';
import { optimism } from 'viem/chains';
import ChooseGame from './components/choosePage'
import EnterGame from './components/enterPage'
import GameDeck from './components/gameDeck'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useNavigate } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter , Routes, Route } from 'react-router-dom'

export const publicClient = createPublicClient({
  chain: optimism,
  transport: http(
    'https://opt-mainnet.g.alchemy.com/v2/Vu6asWumE3Ozc3vkSRy7Uya0q-G5NLYR'
  )
})

const unityContext = new UnityContext({
  loaderUrl: "UnityBuild/Barocasino.loader.js",
  dataUrl: "UnityBuild/Barocasino.data",
  frameworkUrl: "UnityBuild/Barocasino.framework.js",
  codeUrl: "UnityBuild/Barocasino.wasm",
});

type BaccaratState = {
  player: number;
  banker: number;
  pair: number;
  playerPair: number;
  bankerPair: number;
}

const App = () => {
  const [user, setUser] = useState('Check User');
  const [userPoint, setUserPoint] = useState(0)
  const [baccaratResult, setbaccaratResult] = useState<GameResult>();
  const [baccaratStateFromUnity, setBaccaratStateFromUnity] = useState<BaccaratState>({
    player: 0,
    banker: 0,
    pair: 0,
    playerPair: 0,
    bankerPair: 0
  });
  const [betResult, setBetResult] = useState({
    result: 'Lose',
    earn: '0',
  })
  const [betMoney, setBetMoney] = useState({ playerWin: 100, backerWin: 0, Tie: 0, playerPair: 0, bankerPair: 0 })

  const updateBaccaratState = (newState: Partial<BaccaratState>) => {
    setBaccaratStateFromUnity(prevState => ({
      ...prevState,
      ...newState
    }));
  };
  const [ReceivedFromUnityPlayer, setReceivedPlayerFromUnity] = useState(false);
  const [ReceivedFromUnityBanker, setReceivedBankerFromUnity] = useState(false);


  useEffect(function () {
    unityContext.on("MoveCallback", function (direction, xpos, ypos) {
      setDirection(direction);
      setXpos(xpos);
      setYpos(ypos);
    });
  }, []);

  useEffect(() => {
    console.log(baccaratResult)
    console.log(baccaratStateFromUnity)
  }, [baccaratResult, baccaratStateFromUnity])

  function sendPlayerCard() {
    const target = 'Player'; // 或者 'Player'，或者 'Tie'
    const gameResult = generateBaccaratResult(target);
    // setbaccaratResult(gameResult);
    unityContext.send("BrowserBridge", "GetPalyerShowCard", JSON.stringify(gameResult.bankerCards));
  }

  function sendBankerCard() {
    const target = 'Banker'; // 或者 'Player'，或者 'Tie'
    const gameResult = generateBaccaratResult(target);
    unityContext.send("BrowserBridge", "GetBankerShowCard", JSON.stringify(gameResult.playerCards));
  }

  function sendAllCard() {
    const target = 'Banker'; // 或者 'Player'，或者 'Tie'
    const gameResult = generateBaccaratResult(target);
    unityContext.send("BrowserBridge", "GetBankerShowCard", JSON.stringify(gameResult.playerCards));
    unityContext.send("BrowserBridge", "GetPalyerShowCard", JSON.stringify(gameResult.bankerCards));

  }

  useEffect(() => {
    unityContext.on("BetCallback", function (player, banker, pair, playerPair, bankerPair) {
      console.log('unity bet callback');
      updateBaccaratState({
        player,
        banker,
        pair,
        playerPair,
        bankerPair
      });
    });
  }, [])

  useEffect(() => {
    unityContext.on("RequestPlayerShowCard", function () {
      console.log('unity RequestPlayerShowCard');
      setReceivedPlayerFromUnity(true);
    });
    unityContext.on("RequestBankerShowCard", function () {
      console.log('unity RequestBankerShowCard');
    })
  }, [])
  const [betMoney, setBetMoney] = useState({playerWin: 100, backerWin: 0, Tie: 0, playerPair:0, bankerPair:0})
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Create a signer to interact with the contract
  const signer = provider.getSigner();

  console.log('provider', provider)
  const contractBacarat = new ethers.Contract(
    bacaratAddress,
    BacaratAddress,
    signer,
  );
  console.log('contractBacarat', contractBacarat)

  const readUserInfo = async () => {
    // contractBacarat.addPlayer()
    const user = await contractBacarat.players('0x7FE76e93398fFa540c5de59f2F517c1406F469eA')
    // const user = await contractBacarat.players("PLAYER_ADDRESS");
    
  const readUserInfo = async() => {
    const user = await contractBacarat.players(address)
    setUserPoint(user.toString())
  }

  const enterGame = async () => {


    try {
      // Call the addPlayer function to add a new player
      const tx = await contractBacarat.addPlayer();
      await tx.wait(); // Wait for the transaction to be mined
      setUser('Successfully join in')
    } catch (err) {
    const contractNFT = new ethers.Contract(
      nftAddress,
      NFTAddress,
      signer,
    );
      
    try{

      if(address && address.length > 0){
        const checkBal = await contractNFT.balanceOf(address, 0)
        
        // check user NFT == 1
        // check NFT transfer to host
        // add player

        // check user NFT == 1
        // check NFT 
        if(checkBal.toNumber() > 0){
          const checkApproval = await contractNFT.isApprovedForAll(address, nftAddress)
          if(!checkApproval){
            await contractNFT.setApprovalForAll(nftAddress, true)

            // Call the addPlayer function to add a new player
            const tx = await contractBacarat.addPlayer({ gasLimit: 500000 });
            await tx.wait(); // Wait for the transaction to be mined
          }
        }
      }

      const user = await contractBacarat.players(address)
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
      event:    {
        "anonymous":false,
        "inputs":[
           {
              "indexed":true,
              "internalType":"address",
              "name":"bettor",
              "type":"address"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"playerWin",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"backerWin",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"Tie",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"playerPair",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"bankerPair",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"winAmount",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"pairOutcome",
              "type":"uint256"
           },
           {
              "indexed":false,
              "internalType":"uint256",
              "name":"gameOutcome",
              "type":"uint256"
           }
        ],
        "name":"BetResult",
        "type":"event"
     },
      // args: {
      //   from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      //   to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
      // },
      fromBlock: BigInt(117808743),
      toBlock: "latest",

    });

    console.log('logs', logs[logs.length - 1])

    let betTotalMoney = betMoney.Tie + betMoney.backerWin + betMoney.bankerPair + betMoney.playerPair + betMoney.playerWin

    let results = logs[logs.length - 1]
    let resultMoney = results?.args?.winAmount?.toString()

    if (results?.args?.winAmount?.toString() === '0') {
      setBetResult({
        result: 'Lose',
        earn: `${betTotalMoney}`,
      })
    } else {
      setBetResult({
        result: 'Win',
        earn: resultMoney ? resultMoney : '0',
      })
    }

    readUserInfo()
  }

  // const handleBetResult = (event) => {
  //   // Process the event data (bettor, win amounts, outcome, etc.)
  //   console.log('Bet result:', event.data);
  //   // Update your component's state or perform any necessary actions here
  // };

  // contractBacarat.events.BetResult({ fromBlock: 0 }).on('data', handleBetResult);
  // contractBacarat.events.BetResult({ fromBlock: 0 }).on('error', console.error);


  useEffect(() => {
    // enterGame()
  }, [])

  return (
    <>
      <button onClick={sendPlayerCard}>send player card</button>
      <button onClick={sendBankerCard}>send banker card</button>
      <button onClick={sendAllCard}>send all card</button>
      <Unity unityContext={unityContext}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: 12,
        }}
      />
  useEffect(() => {
    if(address && address.length > 0){
      enterGame()
    }else{
      navigate('/')
    }
  }, [address])

  return (
    <>

    <Routes>
          <Route element={<EnterGame />} path={'/'}></Route>
          <Route element={<ChooseGame />} path='/login'></Route>
          <Route element={<GameDeck />} path='/game'></Route>
    </Routes>

    <div>
      <div>
        <button onClick={readUserInfo}>Read Info</button>
        <button onClick={betUser}>Bet</button>
        <button onClick={enterGame}>check login</button>
        <button onClick={() => disconnect()}>
          Disconnect
        </button>
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

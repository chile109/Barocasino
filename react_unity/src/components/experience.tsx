import { generateBaccaratResult, type GameResult } from '../utils/baccarat';
import { Unity, useUnityContext } from "react-unity-webgl";
import React, { useEffect, useState, useCallback } from 'react';
import { createPublicClient, custom, http, createWalletClient, Address } from 'viem'
import { optimism, sepolia } from 'viem/chains'
import { bacaratAddress } from '../assets/definitions/constants/bacarat'
import BacaratABI from '../assets/definitions/abi/barcarat.json'
import { client, walletClient, userPointStore } from '../store/store'
import { check } from 'prettier';
import { useAccount } from 'wagmi'

const Experience = () => {
  // const [betMoney, setBetMoney] = useState({ playerWin: 0, bankerWin: 0, Tie: 0, playerPair: 0, bankerPair: 0 })
  const [betResult, setBetResult] = useState({
    result: 'Lose',
    earn: '0',
  })
  const [score, setScore] = useState();
  const { address } = useAccount()
  const { userPoints, setUserPoints } = userPointStore();
  const { unityProvider, isLoaded, loadingProgression, sendMessage, addEventListener, removeEventListener  } = useUnityContext({
    loaderUrl: "UnityBuild/Barocasino.loader.js",
    dataUrl: "UnityBuild/Barocasino.data",
    frameworkUrl: "UnityBuild/Barocasino.framework.js",
    codeUrl: "UnityBuild/Barocasino.wasm",
  });

  // console.log('isLoaded', isLoaded)
  
  // console.log('unityContext', isLoaded)
  // const sendBankerCard = () => {
  //   const target = 'Banker';
  //   const gameResult: GameResult = generateBaccaratResult(target);
  //   unityContext.send(
  //     'BrowserBridge',
  //     'GetBankerShowCard',
  //     `{"Items": ${JSON.stringify(gameResult.bankerCards)}}`
  //   );
  // };

  const sendPlayerCard = () => {
    const target = 'Player';
    const gameResult: GameResult = generateBaccaratResult(target);
    console.log('Player gameResult', gameResult);
    // console.log('Player gameResult', JSON.stringify(gameResult.playerCards));
    sendMessage(
      'BrowserBridge',
      'GetPlayerShowCard',
      `{"Items": ${JSON.stringify(gameResult.playerCards)}}`
    );
  };

  async function sendResult(result: string) {
    const gameResult: GameResult = generateBaccaratResult(result);

    // unityContext.send(
    //   'BrowserBridge',
    //   'GetPlayerShowCard',
    //   `{"Items": ${JSON.stringify(gameResult.bankerCards)}}`
    // );
    console.log('gameResult', gameResult.bankerCards)
    //await  sec
    await new Promise((resolve) => setTimeout(resolve, 3000));

    sendMessage(
      'BrowserBridge',
      'GetPlayerShowCard',
      `{"Items": ${JSON.stringify(gameResult.bankerCards)}}`
    )

    //await 1 sec
    await new Promise((resolve) => setTimeout(resolve, 1000));

    sendMessage(
      'BrowserBridge',
      'GetBankerShowCard',
      `{"Items": ${JSON.stringify(gameResult.playerCards)}}`
    );

  }

  const betUser = async (player: number, banker: number, tie: number, playerPair: number, bankerPair: number) => {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

    const { request } = await client.simulateContract({
      account: account as Address,
      address: bacaratAddress as Address,
      abi: BacaratABI,
      functionName: 'bet',
      args: [player, banker, tie, playerPair, bankerPair],
      gas: BigInt(100000), 
      chain: sepolia, 
    })
    await walletClient.writeContract(request)

    // const result = await contractBacarat.bet(betMoney.Tie, betMoney.bankerWin, betMoney.bankerPair, betMoney.playerPair, betMoney.playerWin);
    // const receipt = await result.wait();

    const logs = await client.getLogs({
      address: bacaratAddress,
      event: {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "bettor",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "playerWin",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "backerWin",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "Tie",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "playerPair",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "bankerPair",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "winAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "pairOutcome",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "gameOutcome",
            "type": "uint256"
          }
        ],
        "name": "BetResult",
        "type": "event"
      },
      // args: {
      //   from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      //   to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
      // },
      fromBlock: BigInt(5680397),
      toBlock: "latest",

    });

    let betTotalMoney = player + banker + tie + playerPair + bankerPair

    let results = null;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i]?.args?.bettor?.toLowerCase() === account.toLowerCase()) {
        results = logs[i];
        break;
      }
    }

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

    const checkWhoWin = await client.readContract({
      address: bacaratAddress as Address,
      abi: BacaratABI,
      functionName: 'getBetResult',
    })


    enum Result {
      Player = 1,
      Banker = 2,
      Tie = 3,
    }
    
    // const gameResultNumber: number = checkWhoWin;
    const gameResultString: string = Result[Number(checkWhoWin)].toString();

    sendResult(gameResultString)    

    // const userPoint = await client.readContract({
    //   address: bacaratAddress,
    //   abi: BacaratABI,
    //   functionName: 'players',
    //   args: [address],
    // })

    // sendMessage(
    //   "BrowserBridge",
    //   "GetCredit",
    //   String(userPoints)
    // );
  }

  const handleGetBet = useCallback((player: any, banker: any, tie: any, playerPair: any, bankerPair: any) => {
    betUser(player, banker, tie, playerPair, bankerPair)
  }, []);

  useEffect(() => {
    addEventListener("BetCallback", handleGetBet);
    return () => {
      removeEventListener("BetCallback", handleGetBet);
    };
  }, [addEventListener, removeEventListener, handleGetBet]);

  useEffect(() => {
    console.log(loadingProgression, loadingProgression === 1, isLoaded)
    if(loadingProgression === 1){
      console.log('userPoints', String(userPoints))

      console.log('sendMessage', sendMessage)
      // sendMessage(
      //   "BrowserBridge",
      //   "GetCredit",
      //   String(userPoints)
      // );

      init()
    }
  }, [isLoaded])

  const init = async() => {
    // const userPoint = await client.readContract({
    //   address: bacaratAddress,
    //   abi: BacaratABI,
    //   functionName: 'players',
    //   args: [address],
    // })

    console.log('init', init)
    await new Promise((resolve) => setTimeout(resolve, 3000)); 

    sendMessage(
      "BrowserBridge",
      "GetCredit",
      // String(userPoint)
      userPoints
    );
  }

  // useEffect(() => {
  //   unityContext.on(
  //     "BetCallback",
  //     (player, banker, tie, playerPair, bankerPair) => {
  //       console.log(player, banker, tie, playerPair, bankerPair);
  //       betUser(player, banker, tie, playerPair, bankerPair)
  //     }
  //   );
  // }, []);

  // useEffect(() => {
  //   // console.log(player, banker, tie, playerPair, bankerPair);
  //   addEventListener("BetCallback", setScore);
  //   return () => {
  //     removeEventListener("BetCallback", setScore);
  //   };
  // }, [addEventListener, removeEventListener, setScore]);

  // useEffect(() => {
  //   addEventListener("SetScore", setScore);
  //   return () => {
  //     removeEventListener("SetScore", setScore);
  //   };
  // }, [addEventListener, removeEventListener, setScore]);

  return (
    <div className='experience'>
      <p>Loading {loadingProgression}... {isLoaded}</p>
      <div className='game-block'>
        <Unity unityProvider={unityProvider}
          style={{
            height: "100%",
            width: '100%',
            borderRadius: '15px',
          }} />
      </div>
      <button onClick={sendPlayerCard}>send player card</button>
      <button onClick={init}>init point</button>

      {/* <button onClick={sendPlayerCard}>send player card</button>
      <button onClick={sendBankerCard}>send banker card</button>
      <button onClick={sendResult.bind(this, 'Player')}>send result</button> */}
      {/* <button onClick={() => sendResult('tie')}>Bet</button> */}
      <p>{betResult.result} {betResult.earn}</p>
    </div>
  );
};

export default Experience;

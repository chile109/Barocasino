import { generateBaccaratResult, type GameResult } from '../utils/baccarat';
import Unity, { UnityContext } from 'react-unity-webgl';
import React, { useEffect, useState } from 'react';
import { createPublicClient, custom, http, createWalletClient, Address } from 'viem'
import { optimism, sepolia } from 'viem/chains'
import { bacaratAddress } from '../assets/definitions/constants/bacarat'
import BacaratABI from '../assets/definitions/abi/barcarat.json'

export const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export const walletClient = createWalletClient({
  chain: sepolia,
  transport:  custom(window.ethereum)
})

const unityContext = new UnityContext({
  loaderUrl: "UnityBuild/Barocasino.loader.js",
  dataUrl: "UnityBuild/Barocasino.data",
  frameworkUrl: "UnityBuild/Barocasino.framework.js",
  codeUrl: "UnityBuild/Barocasino.wasm",
});

const Experience = () => {
  // const [betMoney, setBetMoney] = useState({ playerWin: 0, bankerWin: 0, Tie: 0, playerPair: 0, bankerPair: 0 })
  const [betResult, setBetResult] = useState({
    result: 'Lose',
    earn: '0',
  })

  const sendBankerCard = () => {
    const target = 'Banker';
    const gameResult: GameResult = generateBaccaratResult(target);
    unityContext.send(
      'BrowserBridge',
      'GetBankerShowCard',
      `{"Items": ${JSON.stringify(gameResult.bankerCards)}}`
    );
  };

  const sendPlayerCard = () => {
    const target = 'Player';
    const gameResult: GameResult = generateBaccaratResult(target);
    // console.log('Player gameResult', gameResult);
    // console.log('Player gameResult', JSON.stringify(gameResult.playerCards));
    unityContext.send(
      'BrowserBridge',
      'GetPlayerShowCard',
      `{"Items": ${JSON.stringify(gameResult.playerCards)}}`
    );
  };

  async function sendResult(result: string) {
    const gameResult: GameResult = generateBaccaratResult(result);

    unityContext.send(
      'BrowserBridge',
      'GetPlayerShowCard',
      `{"Items": ${JSON.stringify(gameResult.playerCards)}}`
    );

    //await 1 sec
    await new Promise((resolve) => setTimeout(resolve, 1000));

    unityContext.send(
      'BrowserBridge',
      'GetBankerShowCard',
      `{"Items": ${JSON.stringify(gameResult.bankerCards)}}`
    );

  }

  const betUser = async (player: number, banker: number, tie: number, playerPair: number, bankerPair: number) => {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    /* global BigInt */ 
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
      fromBlock: BigInt(117808743),
      toBlock: "latest",

    });

    let betTotalMoney = player + banker + tie + playerPair + bankerPair

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
  }

  useEffect(() => {
    unityContext.on('RequestPlayerShowCard', () => {
      sendPlayerCard()
    });
    unityContext.on('RequestBankerShowCard', () => {
      sendBankerCard()
    });
    unityContext.on(
      "BetCallback",
      (player, banker, tie, playerPair, bankerPair) => {
        betUser(player, banker, tie, playerPair, bankerPair)
      }
    );
    // Before navigation or modal close
    unityContext.quitUnityInstance()
    unityContext.removeAllEventListeners()
  }, []);

  return (
    <div className='experience'>
      <div className='game-block'>
        <Unity unityContext={unityContext}
          style={{
            height: "100%",
            width: '100%',
            borderRadius: '15px',
          }} />
      </div>
      <button onClick={sendPlayerCard}>send player card</button>
      <button onClick={sendBankerCard}>send banker card</button>
      <button onClick={sendResult.bind(this, 'Player')}>send result</button>
      {/* <button onClick={betUser}>Bet</button> */}
      <p>{betResult.result} {betResult.earn}</p>
    </div>
  );
};

export default Experience;

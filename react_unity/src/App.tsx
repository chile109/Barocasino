import { ConnectButton } from '@rainbow-me/rainbowkit';
//import React from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { bacaratAddress } from '../src/assets/definitions/constants/bacarat'
import BacaratAddress from '../src/assets/definitions/abi/barcarat.json'
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import {
  generateBaccaratResult,
  GameResult
} from './utils/baccarat';

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://eth-sepolia.g.alchemy.com/v2/mZBt78HBjoKpxAt7vWXtibpvQxEg4Dhb'
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
  const [direction, setDirection] = useState("");
  const [xpos, setXpos] = useState(0);
  const [ypos, setYpos] = useState(0);
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

  function moveRight() {
    // unityContext.send("Sphere", "MoveRight", 10);
    const target = 'Banker'; // 或者 'Player'，或者 'Tie'
    const gameResult = generateBaccaratResult(target);
    setbaccaratResult(gameResult);
    unityContext.send("BrowserBridge", "GetPalyerShowCard", JSON.stringify(gameResult.bankerCards));
  }

  function moveLeft() {
    // unityContext.send("Sphere", "MoveLeft", 10);
    const target = 'Player'; // 或者 'Player'，或者 'Tie'
    const gameResult = generateBaccaratResult(target);
    unityContext.send("BrowserBridge", "GetPalyerShowCard", JSON.stringify(gameResult.playerCards));
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
    setUserPoint(user.toString())
  }

  const enterGame = async () => {


    try {
      // Call the addPlayer function to add a new player
      const tx = await contractBacarat.addPlayer();
      await tx.wait(); // Wait for the transaction to be mined
      setUser('Successfully join in')
    } catch (err) {
      setUser('User Already in')
      console.log('err', err)
    }

    // contractBacarat.addPlayer()
    const user = await contractBacarat.players('0x7FE76e93398fFa540c5de59f2F517c1406F469eA')
    // const user = await contractBacarat.players("PLAYER_ADDRESS");
    setUserPoint(user.toString())
  }

  const betUser = async () => {
    const result = await contractBacarat.bet(betMoney.Tie, betMoney.backerWin, betMoney.bankerPair, betMoney.playerPair, betMoney.playerWin);
    // await result.wait(); // Wait for the transaction to be mined
    console.log('result', result)
    //     const betResult = await contractBacarat.betResult();
    // console.log('Bet result:', betResult); // This will be a number representing the GameOutcome enum (0 - BankerWin, 1 - PlayerWin, 2 - Tie)
    const receipt = await result.wait();
    console.log('Transaction receipt:', receipt);

    // console.log(provider.getLogs())
    const logs = await publicClient.getLogs({
      address: "0x5102F05f5971975709f2cFEe0B8CbDAd7063Ae16",
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
      fromBlock: BigInt(5543048),
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
    enterGame()
  }, [])

  return (
    <>
      <Unity unityContext={unityContext}
        style={{
          height: "100vh",
          width: "100vw",
        }} />
    </>
  );
};

export default App;

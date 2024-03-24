import { ConnectButton } from '@rainbow-me/rainbowkit';
//import React from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers';
import { bacaratAddress } from '../src/assets/definitions/constants/bacarat'
import BacaratAddress from '../src/assets/definitions/abi/barcarat.json'
import { nftAddress } from '../src/assets/definitions/constants/NFT'
import NFTAddress from '../src/assets/definitions/abi/NFT.json'
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import EnterPage from './components/enterPage'
import 'bootstrap/dist/css/bootstrap.min.css';

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    'https://eth-sepolia.g.alchemy.com/v2/mZBt78HBjoKpxAt7vWXtibpvQxEg4Dhb'
  )
})

const unityContext = new UnityContext({
  // loaderUrl: "UnityBuild/Baccarate Build.loader.js",
  // dataUrl: "UnityBuild/Baccarate Build.data",
  // frameworkUrl: "UnityBuild/Baccarate Build.framework.js",
  // codeUrl: "UnityBuild/Baccarate Build.wasm",
  loaderUrl: "UnityBuild/webgl_app.loader.js",
  dataUrl: "UnityBuild/webgl_app.data",
  frameworkUrl: "UnityBuild/webgl_app.framework.js",
  codeUrl: "UnityBuild/webgl_app.wasm",
});

const App = () => {
  const [direction, setDirection] = useState("");
  const [xpos, setXpos] = useState(0);
  const [ypos, setYpos] = useState(0);
  const [user, setUser] = useState('Check User');
  const [userPoint, setUserPoint] = useState(0)
  const [betResult, setBetResult] = useState({
    result: 'Lose',
    earn: '0',
  })
  const [betMoney, setBetMoney] = useState({playerWin: 100, backerWin: 0, Tie: 0, playerPair:0, bankerPair:0})

  useEffect(function () {
    unityContext.on("MoveCallback", function (direction,xpos, ypos) {
      setDirection(direction);
      setXpos(xpos);
      setYpos(ypos);
    });
  }, []);

  function moveRight() {
    unityContext.send("Sphere", "MoveRight", 10);
  }
  function moveLeft() {
    unityContext.send("Sphere", "MoveLeft", 10);
  }

  

  const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Create a signer to interact with the contract
  const signer = provider.getSigner();

    // console.log('provider', provider)
    const contractBacarat = new ethers.Contract(
      bacaratAddress,
      BacaratAddress,
      signer,
    );
    // console.log('contractBacarat', contractBacarat)
    
    const readUserInfo = async() => {
      // contractBacarat.addPlayer()
      const user = await contractBacarat.players('0x7FE76e93398fFa540c5de59f2F517c1406F469eA')
      console.log('user', user)
      // const user = await contractBacarat.players("PLAYER_ADDRESS");
      setUserPoint(user.toString())
    }

  const enterGame = async () => {

    const contractNFT = new ethers.Contract(
      nftAddress,
      NFTAddress,
      signer,
    );
    

    try{

      // const checkUser = await contractBacarat.players()
      const checkBal = await contractNFT.balanceOf('0x7FE76e93398fFa540c5de59f2F517c1406F469eA', 0)
      // console.log('checkUser', checkBal.toString())
      
      
      // check user NFT == 1
      // check NFT transfer to host
      // add player

      // check user NFT == 1
      // check NFT 
      if(checkBal.toString() == '1'){

        const checkApproval = await contractNFT.isApprovedForAll('0x7FE76e93398fFa540c5de59f2F517c1406F469eA', '0xE60ceDF33a6473E69f4eb32b52687F0e242B067b')

        if(!checkApproval){
          await contractNFT.setApprovalForAll('0xE60ceDF33a6473E69f4eb32b52687F0e242B067b', true)

          // Call the addPlayer function to add a new player
          const tx = await contractBacarat.addPlayer();
          await tx.wait(); // Wait for the transaction to be mined
        }
        
        console.log('tx')
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

    console.log('logs', logs[logs.length-1])

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
    {/* <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,
      }}
    >
      <ConnectButton />
    </div> */}
    <EnterPage />
    <div>
      <div>
      {/* <button onClick={enterGame}>Enter Game</button> */}
        <button onClick={readUserInfo}>Read Info</button>
        <button onClick={betUser}>Bet</button>
      </div>
      <div>
        <p>{user} {userPoint}</p>
        <p>{betResult.result} {betResult.earn}</p>
      </div>
      <button onClick={moveRight}>MoveRight</button>
      <button onClick={moveLeft}>MoveLeft</button>
      {<p>{`Moved! ${direction} x = ${xpos} y = ${ypos} `}</p>}
      <Unity unityContext={unityContext} 
        style={{
          height: "100%",
          width: 400,
          border: "2px solid black",
          background: "grey",
        }}/>
    </div>
    </>
  );
};

export default App;

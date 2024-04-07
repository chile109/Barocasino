import { generateBaccaratResult, type GameResult } from '../utils/baccarat';
import Unity, { UnityContext } from 'react-unity-webgl';
import React, { useEffect } from 'react';

const unityContext = new UnityContext({
  loaderUrl: "UnityBuild/Barocasino.loader.js",
  dataUrl: "UnityBuild/Barocasino.data",
  frameworkUrl: "UnityBuild/Barocasino.framework.js",
  codeUrl: "UnityBuild/Barocasino.wasm",
});
const Experience = () => {

  const sendBankerCard = () => {
    const target = 'Banker';
    const gameResult: GameResult = generateBaccaratResult(target);
    console.log('Banker gameResult', gameResult);
    console.log('Banker gameResult', JSON.stringify(gameResult.bankerCards));
    unityContext.send(
      'BrowserBridge',
      'GetBankerShowCard',
      `{"Items": ${JSON.stringify(gameResult.bankerCards)}}`
    );
  };

  const sendPlayerCard = () => {
    const target = 'Player';
    const gameResult: GameResult = generateBaccaratResult(target);
    console.log('Player gameResult', gameResult);
    console.log('Player gameResult', JSON.stringify(gameResult.playerCards));
    unityContext.send(
      'BrowserBridge',
      'GetPlayerShowCard',
      `{"Items": ${JSON.stringify(gameResult.playerCards)}}`
    );
  };

  const sendAllCard = () => {
    const target = 'Banker';
    const gameResult: GameResult = generateBaccaratResult(target);
    unityContext.send(
      'BrowserBridge',
      'GetPlayerShowCard',
      JSON.stringify(gameResult.playerCards)
    );
    unityContext.send(
      'BrowserBridge',
      'GetBankerShowCard',
      JSON.stringify(gameResult.bankerCards)
    );
  };

  useEffect(() => {
    unityContext.on('RequestPlayerShowCard', () => {
      sendPlayerCard()
    });
    unityContext.on('RequestBankerShowCard', () => {
      sendBankerCard()
    });
    unityContext.on('BetCallBack', () => {
      console.log('BetCallBack');
    })
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
      <button onClick={sendAllCard}>send all card</button>
    </div>
  );
};

export default Experience;

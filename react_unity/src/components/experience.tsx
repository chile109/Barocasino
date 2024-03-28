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

  const sendPlayerCard = () => {
    const target = 'Player';
    const gameResult: GameResult = generateBaccaratResult(target);
    unityContext.send(
      'BrowserBridge',
      'GetPalyerShowCard',
      JSON.stringify(gameResult.bankerCards)
    );
  };

  const sendBankerCard = () => {
    const target = 'Banker';
    const gameResult: GameResult = generateBaccaratResult(target);
    unityContext.send(
      'BrowserBridge',
      'GetBankerShowCard',
      JSON.stringify(gameResult.playerCards)
    );
  };

  const sendAllCard = () => {
    const target = 'Banker';
    const gameResult: GameResult = generateBaccaratResult(target);
    unityContext.send(
      'BrowserBridge',
      'GetPalyerShowCard',
      JSON.stringify(gameResult.playerCards)
    );
    unityContext.send(
      'BrowserBridge',
      'GetBankerShowCard',
      JSON.stringify(gameResult.playerCards)
    );
  };

  useEffect(() => {
    unityContext.on('RequestPlayerShowCard', () => {
      console.log('unity RequestPlayerShowCard');
    });
    unityContext.on('RequestBankerShowCard', () => {
      console.log('unity RequestBankerShowCard');
    });
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

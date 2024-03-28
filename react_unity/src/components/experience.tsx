import { generateBaccaratResult, type GameResult } from '../utils/baccarat';
import Unity, { UnityContext } from 'react-unity-webgl';
import React, { useEffect } from 'react';

const unityContext = new UnityContext({
  loaderUrl: 'unity/Build/unity.loader.js',
  dataUrl: 'unity/Build/unity.data',
  frameworkUrl: 'unity/Build/unity.framework.js',
  codeUrl: 'unity/Build/unity.wasm',
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
            width: 800,
            border: "2px solid black",
            background: "grey",
          }} />
      </div>
    </div>
  );
};

export default Experience;

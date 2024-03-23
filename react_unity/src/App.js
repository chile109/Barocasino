
import React, { useState, useEffect } from "react";
import './App.css';

//import React from "react";
import Unity, { UnityContext } from "react-unity-webgl";

const unityContext = new UnityContext({
  loaderUrl: "UnityBuild/Baccarate Build.loader.js",
  dataUrl: "UnityBuild/Baccarate Build.data",
  frameworkUrl: "UnityBuild/Baccarate Build.framework.js",
  codeUrl: "UnityBuild/Baccarate Build.wasm",
  
});



function App() {


  const [direction, setDirection] = useState("");
  const [xpos, setXpos] = useState(0);
  const [ypos, setYpos] = useState(0);

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

  

  return (
    <div>
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
  );
}
export default App;
import { useEffect } from 'react';
import './style.css'; // Import your custom CSS file
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNavigate } from "react-router-dom";
import { useAccount, useConnect } from 'wagmi'
// import { ConnectWallet } from "@thirdweb-dev/react";

const EnterGame = () => {
  const { address } = useAccount()
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  useEffect(() => {
    if(address && address.length > 0){
      handleLogin()
    }
  }, [address])

  return (
    <div>
      <section className="section login">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex login-block">
                <div className="banner"></div>
                <div className="banner-text">
                     <div className="logo"><img className='w-full h-full' src="images/ui_Logo.png" alt="" /></div>
                     <div className="player-login">
                       <p className="intro-text">Decentralized Tournament</p>
                       <div className="btn-group">
                         <div className="btn btn-main btn-lg">
                          <ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" />
                        </div>
                       </div>
                     </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EnterGame;

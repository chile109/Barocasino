import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './style.css'; // Import your custom CSS file
import { ConnectButton } from '@rainbow-me/rainbowkit';

const EnterGame = () => {
    const [start, setStart] = useState(false)


  return (
    <div>
      <section className="section login">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="d-flex login-block">
                <div className="banner"></div>
                <div className="banner-text">

                {!start && (
                    <>
                     <div className="logo"><img className='w-full h-full' src="../assets/images/ui_Logo.png" alt="" /></div>
                     <div className="player-login">
                       <p className="intro-text">Decentralized Tournament</p>
                       <div className="btn-group">
                         <button className="btn btn-main btn-lg"><ConnectButton accountStatus="avatar" showBalance={false} chainStatus="none" /></button>
                       </div>
                     </div>
                     </>
                )}
                 {start && (
                    <>
                                       <div className="player-info">
                    <div className="wrap">
                      <div className="avatar" style={{backgroundImage: "url('../assets/images/avatar.png')"}}></div>
                    </div>
                    <div className="wrap">
                      <div className="balance">
                        <div className="icon">$</div>
                        <div className="val">12312312</div>
                      </div>
                    </div>
                    <button className="btn btn-sub btn-lg">Claim the reward</button>
                  </div>
                     </>
                )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section tournament">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h4 className="title-s">Please choose a Tournament</h4>
              <div className="row">
                {/* Tournament items */}
                {/* You can map through your data and render tournament items dynamically */}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="section tournament">
        <div className="container">
          <div className="row">
            {/* Game block */}
            {/* Tournament intro */}
            {/* Tournament ranks */}
          </div>
        </div>
      </section>
      <div className="modal modal-main fade" id="alertModal" tabIndex="-1" role="dialog" aria-labelledby="alertModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Alert</h1>
            </div>
            <div className="modal-body">
              <div className="content">Your virtual currency will be transferred to XXXXX.</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-main btn-lg" type="button" data-bs-dismiss="modal">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterGame;

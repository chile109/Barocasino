import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './style.css'; // Import your custom CSS file
// import { ethers } from 'ethers';
import { bacaratAddress } from '../../src/assets/definitions/constants/bacarat'
import BacaratABI from '../../src/assets/definitions/abi/barcarat.json'
import NFT1 from '../../src/assets/images/NFT1.png'
import CheckModal from './checkModal'
import { useAccount } from 'wagmi'
import { client, userPointStore } from '../store/store.ts'

const ChooseGame = () => {
  const { address } = useAccount()
  const [userPoint, setUserPoint] = useState(0)
  
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const { userPoints, setUserPoints } = userPointStore();

  const getLogin = async () => {
    try{
      const userPoint = await client.readContract({
        address: bacaratAddress,
        abi: BacaratABI,
        functionName: 'players',
        args: [address],
      })

      console.log('userPoint:' + userPoint.toString());

      setUserPoints(String(userPoint))
    }catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    if(address && address.length > 0){
      getLogin()
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

                  <div className="player-info">
                  <img src="images/ui_Logo.png" alt="" />
                    <div className="wrap">
                      <div className="avatar" style={{backgroundImage: "url('images/avatar.png')"}}></div>
                    </div>
                    <div className="wrap">
                      <div className="balance">
                        <div className="icon">$</div>
                        <div className="val">{userPoints}</div>
                      </div>
                    </div>
                    
                    <CheckModal show={showModal} onHide={handleCloseModal} />
                    <button className="btn btn-sub btn-lg">Claim the reward</button>
                  </div>

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

              <button className="card w-25" onClick={handleShowModal}>
                {/* <img className="card-img-top" src="..." alt="Card image cap" /> */}
                <img className='card-img-top p-3' src={NFT1} alt="" />
                <div className="card-body w-100 ">
                  <h5 className="card-title">Name</h5>
                  <p className="card-text">ends in 7 days</p>
                  {/* <Button variant="primary" onClick={handleShowModal}>
                    Open Modal
                  </Button> */}
                  <div className="wrap w-100">
                      <div className="balance">
                        <div className="icon">$</div>
                        <div className="val">{userPoints}</div>
                      </div>
                    </div>
                </div>
              </button>

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
          {/* <div>
                  <img src={NFT1} alt="" />
                </div> */}
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

export default ChooseGame;

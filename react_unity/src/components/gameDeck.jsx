import Experience from './experience';
import { useNavigate } from "react-router-dom";

export default function GameDeck() {
    const avatarUrl = "images/avatar.png"; 
    const NFTUrl = "images/NFT1.png"
    const navigate = useNavigate()

    const handleBack = async () => {
        navigate('/login')
    }

  return (
    <div>
       <div className="container">
        <div className="row">
          {/* <!--遊戲遊玩頁--> */}
          <div className="col-12">
            <Experience />
          </div>
          {/* <!--該錦標賽介紹--> */}
          <div className="col-lg-7">
            <div className="tournament-intro"> 
              <div className="d-flex">
                {/* <!--Button點擊返回錦標賽選擇--> */}
                <button className="btn btn-back" onClick={handleBack}>
                  <div className="icon icon-arrow-left"></div>
                </button>
                <div className="NFT" style={{ backgroundImage: `url(${NFTUrl})` }}> </div>
                <div className="intro"> 
                  <div className="time">ends in 7 days</div>
                  <div className="name">Decentralized Tournament</div>
                  <div className="balance">
                    <div className="icon icon-currency"></div>
                    <div className="val">12312312</div>
                  </div>
                </div>
              </div>
              <div className="content">Room Intro Room IntroRoom IntroRoom IntroRoom IntroRoom IntroRoom IntroRoom IntroRoom IntroRoom IntroRoom Intro</div>
            </div>
          </div>
          {/* <!--該錦標賽名次--> */}
          <div className="col-lg-5">
            <ul className="rank-list"> 
              <li> 
                <div className="icon"><img src="images/rank1.png" alt="" /></div>
                <div className="avatar" style={{ backgroundImage: `url(${avatarUrl})` }}> </div>
                <div className="text"> 
                  <div className="name">FSWER#@R@#RESRWERWRW</div>
                  <div className="balance"> 
                    <div className="icon icon-currency"></div>
                    <div className="val">12312312</div>
                  </div>
                </div>
              </li>
              <li> 
                <div className="icon"><img src="images/rank2.png" alt="" /></div>
                <div className="avatar" style={{ backgroundImage: `url(${avatarUrl})` }}> </div>
                <div className="text"> 
                  <div className="name">FSWER#@R@#RESRWERWRW</div>
                  <div className="balance"> 
                    <div className="icon icon-currency"></div>
                    <div className="val">12312312</div>
                  </div>
                </div>
              </li>
              <li> 
                <div className="icon"><img src="images/rank3.png" alt="" /></div>
                <div className="avatar" style={{ backgroundImage: `url(${avatarUrl})` }}> </div>
                <div className="text"> 
                  <div className="name">FSWER#@R@#RESRWERWRW</div>
                  <div className="balance"> 
                    <div className="icon icon-currency"></div>
                    <div className="val">12312312</div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        </div>
    </div>
  )
}

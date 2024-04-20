import { Button, Modal } from 'react-bootstrap';
import { bacaratAddress } from '../assets/definitions/constants/bacarat'
import BacaratABI from '../assets/definitions/abi/barcarat.json'
import { nftAddress } from '../assets/definitions/constants/NFT'
import NFTABI from '../assets/definitions/abi/NFT.json'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers';
import './style.css'
import { useNavigate } from "react-router-dom";
import { mainnet, sepolia } from 'viem/chains'
import { useWriteContract } from 'wagmi'
import { client, walletClient } from '../store/store.ts'


function CheckModal(props) {
  const { show, onHide } = props;
  const { address } = useAccount()
  const navigate = useNavigate()
  
  const checkNFTTransfer = async () => {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

    const checkBal = await client.readContract({
      address: nftAddress,
      abi: NFTABI,
      functionName: 'balanceOf',
      args: [address, 0],
    })
    
    console.log('checkBal:' + checkBal.toString());

    // check user NFT =
    // check NFT transfer to host
    // add player

    // check user NFT == 1
    // check NFT 
    if(checkBal.toString() !== '0'){
      
      const checkApproval = await client.readContract({
        address: nftAddress,
        abi: NFTABI,
        functionName: 'isApprovedForAll',
        args: [address, bacaratAddress],
      })

      console.log('checkApproval', !checkApproval)

      if(!checkApproval){
        // console.log('checkApprovalForTransfer', !checkApproval)
        const { request: request1 } = await client.simulateContract({
          account, 
          address: nftAddress,
          abi: NFTABI,
          functionName: 'setApprovalForAll',
          args: [bacaratAddress, true],
          gas: 500000n, 
          chain: sepolia, 
        })

        console.log('testxxxxx:' + request1);

        await walletClient.writeContract(request1)
        
        
        
      }

      const { request: request2 } = await client.simulateContract({
        account, 
        address: bacaratAddress,
        abi: BacaratABI,
        functionName: 'addPlayer',
        gas: 500000n, 
        chain: sepolia, 
      })
      await walletClient.writeContract(request2)

     

      
    }
    navigate('/game')
  }

  return (
    <Modal className='checkModal' show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Note</Modal.Title>
      </Modal.Header>
      <Modal.Body>Stake your NFT to join to the tournament</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          No
        </Button>
        <Button variant="primary" onClick={checkNFTTransfer}>
          Sure
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CheckModal;

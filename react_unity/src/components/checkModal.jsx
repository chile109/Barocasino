import { Button, Modal } from 'react-bootstrap';
import { bacaratAddress } from '../assets/definitions/constants/bacarat'
import BacaratABI from '../assets/definitions/abi/barcarat.json'
import { nftAddress } from '../assets/definitions/constants/NFT'
import NFTABI from '../assets/definitions/abi/NFT.json'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers';
import './style.css'
import { useNavigate } from "react-router-dom";
import { createPublicClient, http, createWalletClient } from 'viem'
import { mainnet, optimism } from 'viem/chains'

const client = createPublicClient({
  chain: optimism,
  transport: http(),
})

export const walletClient = createWalletClient({
  chain: optimism,
  transport:  http(),
})

function CheckModal(props) {
  const { show, onHide } = props;
  const { address } = useAccount()
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const navigate = useNavigate()
  
    // Create a signer to interact with the contract
  
  const checkNFTTransfer = async () => {

    const checkBal = await client.readContract({
      address: nftAddress,
      abi: NFTABI,
      functionName: 'balanceOf',
      args: [address, 0],
    })

    // console.log('checkBal', checkBal)

    // const signer = provider.getSigner();

    // const contractBacarat = new ethers.Contract(
    //   bacaratAddress,
    //   BacaratAddress,
    //   signer,
    // );

    // const contractNFT = new ethers.Contract(
    //   nftAddress,
    //   NFTAddress,
    //   signer,
    // );

    // const checkBal = await contractNFT.balanceOf(address, 0)
    // console.log('checkBal', checkBal)

    // check user NFT =
    // check NFT transfer to host
    // add player

    // check user NFT == 1
    // check NFT 
    if(checkBal.toString() !== '0'){
      // const checkApproval = await contractNFT.isApprovedForAll(address, nftAddress)
      
      const checkApproval = await client.readContract({
        address: nftAddress,
        abi: NFTABI,
        functionName: 'isApprovedForAll',
        args: [address, nftAddress],
      })

      // console.log('checkApproval', checkApproval)
      if(!checkApproval){

        const { request } = await client.simulateContract({
          address,
          address: nftAddress,
          abi: NFTABI,
          functionName: 'setApprovalForAll',
          args: [nftAddress, true],
        })
        await walletClient.writeContract(request)

        // await contractNFT.setApprovalForAll(nftAddress, true)

        // Call the addPlayer function to add a new player
        // const tx = await contractBacarat.addPlayer({ gasLimit: 500000 });
        // await tx.wait(); // Wait for the transaction to be mined

        const { requests } = await client.simulateContract({
          address,
          address: bacaratAddress,
          abi: BacaratABI,
          functionName: 'addPlayer',
        })
        await walletClient.writeContract(requests)

      }
      navigate('/game')
    }
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

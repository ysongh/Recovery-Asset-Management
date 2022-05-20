import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { Provider } from "zksync-web3";

import WalletTable from '../WalletTable';
import ActionDialog from '../ActionDialog';
import { TOKEN_ADDRESSES } from '../../config/token-addresses';

const provider = new Provider('https://zksync2-testnet.zksync.dev');

function Safe({ safeAddress, rsContract }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [selectedToken, setSelectedToken] = useState("");
  const [safeAssets, setSafeAssets] = useState([]);

  useEffect(() => {
    if(safeAddress) {
      getSafeBalance();
    }
  }, [safeAddress])

  const getSafeBalance = async () => {
    try{
      const assets = [];
      for(let i = 0; i < TOKEN_ADDRESSES.length; i++) {
        const balanceInUnits = await provider.getBalance(safeAddress, "latest", TOKEN_ADDRESSES[i].address);
        const balance = ethers.utils.formatUnits(balanceInUnits, "18");
        assets.push({
          address: TOKEN_ADDRESSES[i].address,
          symbol: TOKEN_ADDRESSES[i].symbol,
          balance: balance
        })
      }

      setSafeAssets(assets);
    } catch(error) {
      console.error(error);
    }
  }

  const withdrawToken = async () => {
    try {
      const txHandle = await rsContract.withdrawTokenfromSafe(selectedToken, ethers.utils.parseEther(amount), {
        customData: {
          // Passing the token to pay fee with
          feeToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
        },
      });
  
      await txHandle.wait();
      setOpen(false);
    }
    catch(error) {
      console.error(error);
      console.log(error.transaction.value.toString());
    }
  }

  const handleClickOpen = (tokenAddress) => {
    setSelectedToken(tokenAddress);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <WalletTable
        assets={safeAssets}
        handleClickOpen={handleClickOpen}
        type="Withdraw" />
      <ActionDialog
        open={open}
        onClose={handleClose}
        amount={amount}
        setAmount={setAmount}
        action={withdrawToken}
        handleClickOpen={handleClickOpen}
        type="Withdraw" />
    </div>
  )
}

export default Safe;
import { Button } from '@/components/ui/button';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useCallback } from 'react';

export const SendSol = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onclick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const lamports = await connection.getMinimumBalanceForRentExemption(0);

    const reciever = Keypair.fromSecretKey(new Uint8Array([]));

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: reciever.publicKey,
        lamports,
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });

    await connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature,
    });

    console.log('Transaction successful');
  }, [publicKey, sendTransaction, connection]);
  return (
    <div>
      <Button onClick={onclick} disabled={!publicKey}>
        Send min sol
      </Button>
    </div>
  );
};

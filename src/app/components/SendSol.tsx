import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
} from '@solana/web3.js';
import React, { useCallback, useState } from 'react';

export const SendSol = () => {
  const [lamports, setLamports] = useState<number | bigint>(0);
  const [reciever, setReciever] = useState<string>('');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onclick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const recieverPubkey = new PublicKey(reciever);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recieverPubkey,
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
      <Input
        placeholder="Enter the solana to be sent"
        onChange={(e) => setLamports(parseInt(e.target.value) * 1e9)}
        required
      />
      <Input
        placeholder="Enter receiver's Solana address"
        onChange={(e) => setReciever(e.target.value)}
        required
      />
      <Button onClick={onclick} type="submit" disabled={!publicKey}>
        Send sol
      </Button>
    </div>
  );
};

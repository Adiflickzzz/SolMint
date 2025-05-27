'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Button } from '@/components/ui/button';

export const CreateMint = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  async function createToken() {
    const mintKeypair = Keypair.generate();
    const lamports = await getMinimumBalanceForRentExemptMint(connection);

    if (!wallet.publicKey) return;

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        lamports,
        newAccountPubkey: mintKeypair.publicKey,
        programId: TOKEN_PROGRAM_ID,
        space: MINT_SIZE,
      }),
      createInitializeMint2Instruction(
        mintKeypair.publicKey,
        9,
        wallet.publicKey,
        wallet.publicKey
      )
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);

    await wallet.sendTransaction(transaction, connection);
    console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
  }

  return (
    <div>
      <Button onClick={createToken}>Create mint account</Button>
    </div>
  );
};

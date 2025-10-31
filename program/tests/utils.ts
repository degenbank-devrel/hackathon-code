import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor'
import {
	TOKEN_PROGRAM_ID,
	createMint,
	createTransferInstruction,
	getOrCreateAssociatedTokenAccount,
	mintTo,
} from '@solana/spl-token'

export async function createSplTokenAndMint(
	provider: AnchorProvider,
	decimals: number = 9,
	mintAuthority: web3.PublicKey,
	freezeAuthority?: web3.PublicKey,
	amount: number = 1000000000000
): Promise<{ mint: web3.PublicKey; tokenAccount: web3.PublicKey }> {
	const connection = provider.connection
	const payer = provider.wallet.publicKey

	const mint = await createMint(
		connection,
		provider.wallet.payer,
		mintAuthority,
		freezeAuthority || null,
		decimals,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)

	const tokenAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		provider.wallet.payer,
		mint,
		payer,
		true,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)

	await mintTo(
		connection,
		provider.wallet.payer,
		mint,
		tokenAccount.address,
		mintAuthority || payer,
		amount,
		[],
		undefined,
		TOKEN_PROGRAM_ID
	)

	return { mint, tokenAccount: tokenAccount.address }
}

export async function createSplToken(
	provider: AnchorProvider,
	decimals: number = 9,
	mintAuthority: web3.PublicKey
): Promise<{ mint: web3.PublicKey }> {
	const connection = provider.connection

	const mint = await createMint(
		connection,
		provider.wallet.payer,
		mintAuthority,
		null,
		decimals,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)

	return { mint }
}

export async function transferToken(
	provider: AnchorProvider,
	mint: web3.PublicKey,
	from: web3.PublicKey,
	to: web3.PublicKey,
	amount: number
): Promise<string> {
	const connection = provider.connection
	const payer = provider.wallet.publicKey

	const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		provider.wallet.payer,
		mint,
		from,
		true,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)

	const toTokenAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		provider.wallet.payer,
		mint,
		to,
		true,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)

	const transaction = new web3.Transaction().add(
		web3.SystemProgram.transfer({
			fromPubkey: payer,
			toPubkey: to,
			lamports: 5000, // Small amount for transaction fee
		}),
		createTransferInstruction(
			fromTokenAccount.address,
			toTokenAccount.address,
			from,
			amount,
			[],
			TOKEN_PROGRAM_ID
		)
	)

	const signature = await provider.sendAndConfirm(transaction)
	return signature
}

export async function getTokenAccount(
	provider: AnchorProvider,
	mint: web3.PublicKey,
	owner: web3.PublicKey
): Promise<web3.PublicKey> {
	const connection = provider.connection
	const tokenAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		provider.wallet.payer,
		mint,
		owner,
		true,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)
	return tokenAccount.address
}

export async function getBalance(
	provider: AnchorProvider,
	mint: web3.PublicKey,
	owner: web3.PublicKey
): Promise<number> {
	const connection = provider.connection
	const tokenAccount = await getOrCreateAssociatedTokenAccount(
		connection,
		provider.wallet.payer,
		mint,
		owner,
		true,
		undefined,
		undefined,
		TOKEN_PROGRAM_ID
	)
	const balance = await connection.getTokenAccountBalance(tokenAccount.address)
	return balance.value.uiAmount || 0
}

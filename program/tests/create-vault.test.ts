import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { DegenBank } from './idl'
import { createSplToken, createSplTokenAndMint, getTokenAccount } from './utils'
import { PublicKey, SystemProgram } from '@solana/web3.js'

describe('de-gen-bank', () => {
	const provider = anchor.AnchorProvider.env()
	anchor.setProvider(provider)

	const program = anchor.workspace.DegenBank as Program<DegenBank>

	//Battle PDA
	const [refereePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from('jura01'), provider.wallet.publicKey.toBuffer()],
		program.programId
	)
	const [battlePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from('battle'), refereePubKey.toBuffer()],
		program.programId
	)

	// example of manager
	const [iqbalPubKey] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from('j0101'), provider.wallet.publicKey.toBuffer()],
		program.programId
	)

	const [alanPubKey] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from('j0202'), provider.wallet.publicKey.toBuffer()],
		program.programId
	)

	// vault address
	const [iqbalVault] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from('vault'), iqbalPubKey.toBuffer()],
		program.programId
	)

	const [alanVault] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from('vault'), alanPubKey.toBuffer()],
		program.programId
	)

	let originTokenMint: anchor.web3.PublicKey = new PublicKey(
		'USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT'
	)

	// mint key / token
	let iqbalVaultMintKey: anchor.web3.PublicKey
	let alanVaultMintKey: anchor.web3.PublicKey

	// vault token address for origin
	let iqbalVaultOriginTokenAccount: anchor.web3.PublicKey
	let alanVaultOriginTokenAccount: anchor.web3.PublicKey
	let iqbalOriginTokenAccount: anchor.web3.PublicKey
	let alanOriginTokenAccount: anchor.web3.PublicKey

	//depositor token account
	let depositorAlanVaultTokenAccount: anchor.web3.PublicKey
	let depositorIqbalVaultTokenAccount: anchor.web3.PublicKey
	let depositorTokenAccount: anchor.web3.PublicKey

	// treasury token account
	let treasuryTokenAccount: anchor.web3.PublicKey
	before(async () => {
		console.log('PublicKeys already set:')
		console.log('Depositor:', provider.wallet.publicKey.toString())
		console.log('Alan Manager Address:', alanPubKey.toString())
		console.log('Iqbal Manager Address:', iqbalPubKey.toString())
		console.log('Alan Vault:', alanVault.toString())
		console.log('Iqbal Vault:', iqbalVault.toString())

		// const amountToTransfer = new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL)
		// const transaction = new anchor.web3.Transaction()

		// transaction.add(
		// 	SystemProgram.transfer({
		// 		fromPubkey: provider.wallet.publicKey,
		// 		toPubkey: alanPubKey,
		// 		lamports: amountToTransfer.toNumber(),
		// 	})
		// )

		// transaction.add(
		// 	SystemProgram.transfer({
		// 		fromPubkey: provider.wallet.publicKey,
		// 		toPubkey: iqbalPubKey,
		// 		lamports: amountToTransfer.toNumber(),
		// 	})
		// )

		// await provider.sendAndConfirm(transaction, [provider.wallet.payer])

		// // const originToken = await createSplTokenAndMint(
		// 	provider,
		// 	9,
		// 	program.provider.publicKey,
		// 	null,
		// 	1000000000000
		// )
		// originTokenMint = originToken.mint

		// create vault token
		// const iqbalToken = await createSplToken(provider, 6, iqbalVault)
		iqbalVaultMintKey = new PublicKey(
			'GkvmPCstdYmg6P6xzRDMoiPNJH5R5qkNjNr58vAsB8ie'
		)
		// const alanToken = await createSplToken(provider, 6, alanVault)
		alanVaultMintKey = new PublicKey(
			'6QHcyGxWhHFGv9hDQ9K835gNS73yHQAyNaLCVKAfo3x6'
		)
		// origin token account for vault
		iqbalVaultOriginTokenAccount = await getTokenAccount(
			provider,
			originTokenMint,
			iqbalVault
		)
		alanVaultOriginTokenAccount = await getTokenAccount(
			provider,
			originTokenMint,
			alanVault
		)

		// origin token account for manager
		iqbalOriginTokenAccount = await getTokenAccount(
			provider,
			originTokenMint,
			iqbalPubKey
		)
		alanOriginTokenAccount = await getTokenAccount(
			provider,
			originTokenMint,
			alanPubKey
		)

		console.log('Origin Token Mint:', originTokenMint.toString())
		console.log('Iqbal Vault Mint:', iqbalVaultMintKey.toString())
		console.log('Alan Vault Mint:', alanVaultMintKey.toString())
		console.log(
			'Iqbal Vault Origin Token Account:',
			iqbalVaultOriginTokenAccount.toString()
		)
		console.log(
			'Alan Vault Origin Token Account:',
			alanVaultOriginTokenAccount.toString()
		)
		console.log(
			'Iqbal Origin Token Account:',
			iqbalOriginTokenAccount.toString()
		)
		console.log('Alan Origin Token Account:', alanOriginTokenAccount.toString())

		// depositor token accpunt
		depositorTokenAccount = await getTokenAccount(
			provider,
			originTokenMint,
			provider.wallet.publicKey
		)
		depositorIqbalVaultTokenAccount = await getTokenAccount(
			provider,
			iqbalVaultMintKey,
			provider.wallet.publicKey
		)
		depositorAlanVaultTokenAccount = await getTokenAccount(
			provider,
			alanVaultMintKey,
			provider.wallet.publicKey
		)
		treasuryTokenAccount = depositorTokenAccount
		console.log('Depositor Token Account:', depositorTokenAccount.toString())
		console.log(
			'Depositor Iqbal Vault Token Account:',
			depositorIqbalVaultTokenAccount.toString()
		)
		console.log(
			'Depositor Alan Vault Token Account:',
			depositorAlanVaultTokenAccount.toString()
		)
		console.log('Treasury Token Account:', treasuryTokenAccount.toString())
	})

	it('Complete battle flow', async () => {
		// Set battle start
		const battleStartTime = new anchor.BN(Math.floor(Date.now()))
		const battleEndTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400)
		const tx = await program.methods
			.setBattlePeriod(battleStartTime, battleEndTime)
			.accountsStrict({
				battle: battlePubKey,
				authority: program.provider.publicKey,
			})
			.rpc()

		console.log('Battle Start:', tx)
	})
})

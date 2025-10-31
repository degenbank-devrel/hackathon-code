// import * as anchor from '@coral-xyz/anchor'
// import { Program } from '@coral-xyz/anchor'
// import { DegenBank } from './idl'
// import { createSplToken, createSplTokenAndMint, getTokenAccount } from './utils'
// import { PublicKey, SystemProgram } from '@solana/web3.js'

// describe('de-gen-bank', () => {
// 	const provider = anchor.AnchorProvider.env()
// 	anchor.setProvider(provider)

// 	const program = anchor.workspace.DegenBank as Program<DegenBank>

// 	//Battle PDA
// 	const [refereePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
// 		[Buffer.from('awww3'), provider.wallet.publicKey.toBuffer()],
// 		program.programId
// 	)
// 	const [battlePubKey] = anchor.web3.PublicKey.findProgramAddressSync(
// 		[Buffer.from('battle'), refereePubKey.toBuffer()],
// 		program.programId
// 	)

// 	// example of manager
// 	const [iqbalPubKey] = anchor.web3.PublicKey.findProgramAddressSync(
// 		[Buffer.from('joni3'), provider.wallet.publicKey.toBuffer()],
// 		program.programId
// 	)

// 	const [alanPubKey] = anchor.web3.PublicKey.findProgramAddressSync(
// 		[Buffer.from('rafael3'), provider.wallet.publicKey.toBuffer()],
// 		program.programId
// 	)

// 	// vault address
// 	const [iqbalVault] = anchor.web3.PublicKey.findProgramAddressSync(
// 		[Buffer.from('vault'), iqbalPubKey.toBuffer()],
// 		program.programId
// 	)

// 	const [alanVault] = anchor.web3.PublicKey.findProgramAddressSync(
// 		[Buffer.from('vault'), alanPubKey.toBuffer()],
// 		program.programId
// 	)

// 	let originTokenMint: anchor.web3.PublicKey = new PublicKey(
// 		'6mHmTJ3irg5MnYraS4XAZddcJfd6BmDdvsRvzDnsimke'
// 	)

// 	// mint key / token
// 	let iqbalVaultMintKey: anchor.web3.PublicKey
// 	let alanVaultMintKey: anchor.web3.PublicKey

// 	// vault token address for origin
// 	let iqbalVaultOriginTokenAccount: anchor.web3.PublicKey
// 	let alanVaultOriginTokenAccount: anchor.web3.PublicKey
// 	let iqbalOriginTokenAccount: anchor.web3.PublicKey
// 	let alanOriginTokenAccount: anchor.web3.PublicKey

// 	//depositor token account
// 	let depositorAlanVaultTokenAccount: anchor.web3.PublicKey
// 	let depositorIqbalVaultTokenAccount: anchor.web3.PublicKey
// 	let depositorTokenAccount: anchor.web3.PublicKey

// 	// treasury token account
// 	let treasuryTokenAccount: anchor.web3.PublicKey
// 	before(async () => {
// 		console.log('PublicKeys already set:')
// 		console.log('Depositor:', provider.wallet.publicKey.toString())
// 		console.log('Alan Manager Address:', alanPubKey.toString())
// 		console.log('Iqbal Manager Address:', iqbalPubKey.toString())
// 		console.log('Alan Vault:', alanVault.toString())
// 		console.log('Iqbal Vault:', iqbalVault.toString())

// 		const amountToTransfer = new anchor.BN(0.01 * anchor.web3.LAMPORTS_PER_SOL)
// 		const transaction = new anchor.web3.Transaction()

// 		transaction.add(
// 			SystemProgram.transfer({
// 				fromPubkey: provider.wallet.publicKey,
// 				toPubkey: alanPubKey,
// 				lamports: amountToTransfer.toNumber(),
// 			})
// 		)

// 		transaction.add(
// 			SystemProgram.transfer({
// 				fromPubkey: provider.wallet.publicKey,
// 				toPubkey: iqbalPubKey,
// 				lamports: amountToTransfer.toNumber(),
// 			})
// 		)

// 		await provider.sendAndConfirm(transaction, [provider.wallet.payer])

// 		// const originToken = await createSplTokenAndMint(
// 		// 	provider,
// 		// 	9,
// 		// 	program.provider.publicKey,
// 		// 	null,
// 		// 	1000000000000
// 		// )
// 		// originTokenMint = originToken.mint

// 		// create vault token
// 		const iqbalToken = await createSplToken(provider, 9, iqbalVault)
// 		iqbalVaultMintKey = iqbalToken.mint
// 		const alanToken = await createSplToken(provider, 9, alanVault)
// 		alanVaultMintKey = alanToken.mint

// 		// origin token account for vault
// 		iqbalVaultOriginTokenAccount = await getTokenAccount(
// 			provider,
// 			originTokenMint,
// 			iqbalVault
// 		)
// 		alanVaultOriginTokenAccount = await getTokenAccount(
// 			provider,
// 			originTokenMint,
// 			alanVault
// 		)

// 		// origin token account for manager
// 		iqbalOriginTokenAccount = await getTokenAccount(
// 			provider,
// 			originTokenMint,
// 			iqbalPubKey
// 		)
// 		alanOriginTokenAccount = await getTokenAccount(
// 			provider,
// 			originTokenMint,
// 			alanPubKey
// 		)

// 		console.log('Origin Token Mint:', originTokenMint.toString())
// 		console.log('Iqbal Vault Mint:', iqbalVaultMintKey.toString())
// 		console.log('Alan Vault Mint:', alanVaultMintKey.toString())
// 		console.log(
// 			'Iqbal Vault Origin Token Account:',
// 			iqbalVaultOriginTokenAccount.toString()
// 		)
// 		console.log(
// 			'Alan Vault Origin Token Account:',
// 			alanVaultOriginTokenAccount.toString()
// 		)
// 		console.log(
// 			'Iqbal Origin Token Account:',
// 			iqbalOriginTokenAccount.toString()
// 		)
// 		console.log('Alan Origin Token Account:', alanOriginTokenAccount.toString())

// 		// depositor token accpunt
// 		depositorTokenAccount = await getTokenAccount(
// 			provider,
// 			originTokenMint,
// 			provider.wallet.publicKey
// 		)
// 		depositorIqbalVaultTokenAccount = await getTokenAccount(
// 			provider,
// 			iqbalVaultMintKey,
// 			provider.wallet.publicKey
// 		)
// 		depositorAlanVaultTokenAccount = await getTokenAccount(
// 			provider,
// 			alanVaultMintKey,
// 			provider.wallet.publicKey
// 		)
// 		treasuryTokenAccount = depositorTokenAccount
// 		console.log('Depositor Token Account:', depositorTokenAccount.toString())
// 		console.log(
// 			'Depositor Iqbal Vault Token Account:',
// 			depositorIqbalVaultTokenAccount.toString()
// 		)
// 		console.log(
// 			'Depositor Alan Vault Token Account:',
// 			depositorAlanVaultTokenAccount.toString()
// 		)
// 		console.log('Treasury Token Account:', treasuryTokenAccount.toString())
// 	})

// 	it('Complete battle flow', async () => {
// 		// Initialize battle
// 		const startTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400)
// 		const endTime = new anchor.BN(Math.floor(Date.now() / 1000) + 186400)

// 		let tx = await program.methods
// 			.initialize(startTime, endTime)
// 			.accountsStrict({
// 				referee: refereePubKey,
// 				battle: battlePubKey,
// 				authority: provider.wallet.publicKey,
// 				treasuryTokenAccount: treasuryTokenAccount,
// 				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
// 				systemProgram: anchor.web3.SystemProgram.programId,
// 			})
// 			.rpc()

// 		console.log('Battle Key:', battlePubKey.toString())
// 		console.log('Treasury Token Account:', treasuryTokenAccount.toString())

// 		console.log('Battle initialized:', tx)

// 		// Create vaults
// 		const target = new anchor.BN(1000000000)

// 		tx = await program.methods
// 			.createVault(target)
// 			.accountsStrict({
// 				manager: alanPubKey,
// 				vault: alanVault,
// 				vaultTokenAccount: alanVaultOriginTokenAccount,
// 				authority: provider.wallet.publicKey,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
// 				managerTokenAccount: alanOriginTokenAccount,
// 				systemProgram: anchor.web3.SystemProgram.programId,
// 			})
// 			.rpc()

// 		console.log('Alan vault created:', tx)

// 		tx = await program.methods
// 			.createVault(target)
// 			.accountsStrict({
// 				manager: iqbalPubKey,
// 				managerTokenAccount: iqbalOriginTokenAccount,
// 				vault: iqbalVault,
// 				vaultTokenAccount: iqbalVaultOriginTokenAccount,
// 				authority: provider.wallet.publicKey,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
// 				systemProgram: anchor.web3.SystemProgram.programId,
// 			})
// 			.rpc()

// 		console.log('Iqbal vault created:', tx)

// 		// Register vaults to battle
// 		tx = await program.methods
// 			.registerVault()
// 			.accountsStrict({
// 				vault: alanVault,
// 				battle: battlePubKey,
// 				authority: provider.wallet.publicKey,
// 			})
// 			.rpc()

// 		console.log('Alan vault registered to battle:', tx)
// 		tx = await program.methods
// 			.registerVault()
// 			.accountsStrict({
// 				vault: iqbalVault,
// 				battle: battlePubKey,
// 				authority: provider.wallet.publicKey,
// 			})
// 			.rpc()

// 		console.log('Iqbal vault registered to battle:', tx)

// 		// Set battle start
// 		const battleStartTime = new anchor.BN(Math.floor(Date.now()))
// 		const battleEndTime = new anchor.BN(Math.floor(Date.now() / 1000) + 86400)
// 		tx = await program.methods
// 			.setBattlePeriod(battleStartTime, battleEndTime)
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				authority: program.provider.publicKey,
// 			})
// 			.rpc()

// 		console.log('Battle Start:', tx)

// 		// Deposit to vaults
// 		const amountIqbal = new anchor.BN(500000)
// 		const amountAlan = new anchor.BN(500000)

// 		console.log('deposit to Iqbal Vault')

// 		tx = await program.methods
// 			.deposit(amountIqbal)
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				vault: iqbalVault,
// 				depositor: provider.wallet.publicKey,
// 				depositorTokenAccount: depositorTokenAccount,
// 				depositorVtokenAccount: depositorIqbalVaultTokenAccount,
// 				vtokenAccount: iqbalVaultMintKey,
// 				vtokenAuthority: iqbalVault,
// 				vaultTokenAccount: iqbalVaultOriginTokenAccount,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 			})
// 			.rpc()

// 		console.log('deposit to Alan Vault')

// 		tx = await program.methods
// 			.deposit(amountAlan)
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				vault: alanVault,
// 				depositor: provider.wallet.publicKey,
// 				depositorTokenAccount: depositorTokenAccount,
// 				depositorVtokenAccount: depositorAlanVaultTokenAccount,
// 				vtokenAccount: alanVaultMintKey,
// 				vtokenAuthority: alanVault,
// 				vaultTokenAccount: alanVaultOriginTokenAccount,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 			})
// 			.rpc()

// 		console.log('Deposit to vaults completed')

// 		// Set battle stop
// 		const stopStartTime = new anchor.BN(0)
// 		const stopEndTime = new anchor.BN(Math.floor(0))
// 		tx = await program.methods
// 			.setBattlePeriod(stopStartTime, stopEndTime)
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				authority: program.provider.publicKey,
// 			})
// 			.rpc()

// 		console.log('Battle Stop:', tx)

// 		// Set winner
// 		tx = await program.methods
// 			.setWinner()
// 			.accountsStrict({
// 				winnerVault: iqbalVault,
// 				winnerVaultTokenAccount: iqbalVaultOriginTokenAccount,
// 				battle: battlePubKey,
// 				authority: provider.wallet.publicKey,
// 			})
// 			.rpc()

// 		console.log('Winner set to Iqbal Vault:', tx)

// 		// Close vaults
// 		tx = await program.methods
// 			.closeVault()
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				vault: iqbalVault,
// 				vaultWinner: iqbalVault,
// 				winnerTokenAccount: iqbalVaultOriginTokenAccount,
// 				winnerManagerTokenAccount: iqbalOriginTokenAccount,
// 				managerTokenAccount: iqbalOriginTokenAccount,
// 				treasuryTokenAccount: treasuryTokenAccount,
// 				vaultTokenAccount: iqbalVaultOriginTokenAccount,
// 				vtokenAuthority: iqbalVault,
// 				authority: provider.wallet.publicKey,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 			})
// 			.rpc()

// 		tx = await program.methods
// 			.closeVault()
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				vault: alanVault,
// 				vaultWinner: iqbalVault,
// 				winnerTokenAccount: iqbalVaultOriginTokenAccount,
// 				winnerManagerTokenAccount: iqbalOriginTokenAccount,
// 				managerTokenAccount: alanOriginTokenAccount,
// 				treasuryTokenAccount: treasuryTokenAccount,
// 				vaultTokenAccount: alanVaultOriginTokenAccount,
// 				vtokenAuthority: alanVault,
// 				authority: provider.wallet.publicKey,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 			})
// 			.rpc()

// 		console.log('Vaults closed')

// 		// Withdraw from vaults
// 		const withdrawAmountIqbal = new anchor.BN(500000)
// 		const withdrawAmountAlan = new anchor.BN(500000)

// 		tx = await program.methods
// 			.withdraw(withdrawAmountIqbal)
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				vault: iqbalVault,
// 				vtokenAuthority: iqbalVault,
// 				depositor: provider.wallet.publicKey,
// 				depositorTokenAccount: depositorTokenAccount,
// 				depositorVtokenAccount: depositorIqbalVaultTokenAccount,
// 				vtokenAccount: iqbalVaultMintKey,
// 				vaultTokenAccount: iqbalVaultOriginTokenAccount,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 			})
// 			.rpc()

// 		tx = await program.methods
// 			.withdraw(withdrawAmountAlan)
// 			.accountsStrict({
// 				battle: battlePubKey,
// 				vault: alanVault,
// 				vtokenAuthority: alanVault,
// 				depositor: provider.wallet.publicKey,
// 				depositorTokenAccount: depositorTokenAccount,
// 				depositorVtokenAccount: depositorAlanVaultTokenAccount,
// 				vtokenAccount: alanVaultMintKey,
// 				vaultTokenAccount: alanVaultOriginTokenAccount,
// 				tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
// 			})
// 			.rpc()

// 		console.log('Withdrawals completed')
// 	})
// })

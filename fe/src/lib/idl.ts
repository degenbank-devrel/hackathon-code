/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/degen_bank.json`.
 */
export type DegenBank = {
	address: 'GoXfRMXGPgf91TSUViswPtnfEbTj4c9D6uqJe3VcPx6q'
	metadata: {
		name: 'degenBank'
		version: '0.1.0'
		spec: '0.1.0'
		description: 'Created with Anchor'
	}
	instructions: [
		{
			name: 'closeVault'
			discriminator: [141, 103, 17, 126, 72, 75, 29, 29]
			accounts: [
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'vaultWinner'
					writable: true
				},
				{
					name: 'winnerTokenAccount'
				},
				{
					name: 'winnerManagerTokenAccount'
				},
				{
					name: 'managerTokenAccount'
				},
				{
					name: 'treasuryTokenAccount'
				},
				{
					name: 'vaultTokenAccount'
				},
				{
					name: 'vtokenAuthority'
				},
				{
					name: 'authority'
					signer: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				}
			]
			args: []
		},
		{
			name: 'createVault'
			discriminator: [29, 237, 247, 208, 193, 82, 54, 135]
			accounts: [
				{
					name: 'manager'
				},
				{
					name: 'managerTokenAccount'
				},
				{
					name: 'vault'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [118, 97, 117, 108, 116]
							},
							{
								kind: 'account'
								path: 'manager'
							}
						]
					}
				},
				{
					name: 'vaultTokenAccount'
				},
				{
					name: 'authority'
					writable: true
					signer: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				},
				{
					name: 'rent'
					address: 'SysvarRent111111111111111111111111111111111'
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				}
			]
			args: [
				{
					name: 'target'
					type: 'u64'
				}
			]
		},
		{
			name: 'deposit'
			discriminator: [242, 35, 198, 137, 82, 225, 242, 182]
			accounts: [
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'depositor'
					writable: true
					signer: true
				},
				{
					name: 'depositorTokenAccount'
					writable: true
				},
				{
					name: 'depositorVtokenAccount'
					writable: true
				},
				{
					name: 'vtokenAccount'
					writable: true
				},
				{
					name: 'vaultTokenAccount'
					writable: true
				},
				{
					name: 'vtokenAuthority'
					writable: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				}
			]
			args: [
				{
					name: 'amount'
					type: 'u64'
				}
			]
		},
		{
			name: 'disqualified'
			discriminator: [56, 168, 89, 107, 88, 206, 62, 95]
			accounts: [
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'authority'
					writable: true
					signer: true
				}
			]
			args: []
		},
		{
			name: 'initialize'
			discriminator: [175, 175, 109, 31, 13, 152, 155, 237]
			accounts: [
				{
					name: 'referee'
				},
				{
					name: 'treasuryTokenAccount'
				},
				{
					name: 'battle'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [98, 97, 116, 116, 108, 101]
							},
							{
								kind: 'account'
								path: 'referee'
							}
						]
					}
				},
				{
					name: 'authority'
					writable: true
					signer: true
				},
				{
					name: 'rent'
					address: 'SysvarRent111111111111111111111111111111111'
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				}
			]
			args: [
				{
					name: 'startAt'
					type: 'i64'
				},
				{
					name: 'endAt'
					type: 'i64'
				}
			]
		},
		{
			name: 'raydiumSwap'
			discriminator: [177, 173, 42, 240, 184, 4, 124, 81]
			accounts: [
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'ammProgram'
				},
				{
					name: 'amm'
					writable: true
				},
				{
					name: 'ammAuthority'
				},
				{
					name: 'ammOpenOrders'
					writable: true
				},
				{
					name: 'ammCoinVault'
					writable: true
				},
				{
					name: 'ammPcVault'
					writable: true
				},
				{
					name: 'marketProgram'
				},
				{
					name: 'market'
					writable: true
				},
				{
					name: 'marketBids'
					writable: true
				},
				{
					name: 'marketAsks'
					writable: true
				},
				{
					name: 'marketEventQueue'
					writable: true
				},
				{
					name: 'marketCoinVault'
					writable: true
				},
				{
					name: 'marketPcVault'
					writable: true
				},
				{
					name: 'marketVaultSigner'
					writable: true
				},
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'vtokenAuthority'
				},
				{
					name: 'vaultTokenSource'
					writable: true
				},
				{
					name: 'vaultTokenDestination'
					writable: true
				},
				{
					name: 'manager'
					writable: true
					signer: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				}
			]
			args: [
				{
					name: 'amountIn'
					type: 'u64'
				},
				{
					name: 'minAmountOut'
					type: 'u64'
				}
			]
		},
		{
			name: 'registerVault'
			discriminator: [121, 62, 4, 122, 93, 231, 119, 49]
			accounts: [
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'authority'
					writable: true
					signer: true
				}
			]
			args: []
		},
		{
			name: 'setBattlePeriod'
			discriminator: [43, 88, 124, 53, 254, 130, 96, 80]
			accounts: [
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'authority'
					writable: true
					signer: true
				}
			]
			args: [
				{
					name: 'startAt'
					type: 'i64'
				},
				{
					name: 'endAt'
					type: 'i64'
				}
			]
		},
		{
			name: 'setWinner'
			discriminator: [207, 149, 39, 13, 31, 233, 182, 109]
			accounts: [
				{
					name: 'winnerVault'
					writable: true
				},
				{
					name: 'winnerVaultTokenAccount'
				},
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'authority'
					writable: true
					signer: true
				}
			]
			args: []
		},
		{
			name: 'withdraw'
			discriminator: [183, 18, 70, 156, 148, 109, 161, 34]
			accounts: [
				{
					name: 'battle'
					writable: true
				},
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'vtokenAuthority'
					writable: true
				},
				{
					name: 'depositor'
					writable: true
					signer: true
				},
				{
					name: 'depositorTokenAccount'
					writable: true
				},
				{
					name: 'depositorVtokenAccount'
					writable: true
				},
				{
					name: 'vtokenAccount'
					writable: true
				},
				{
					name: 'vaultTokenAccount'
					writable: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				}
			]
			args: [
				{
					name: 'amount'
					type: 'u64'
				}
			]
		}
	]
	accounts: [
		{
			name: 'battle'
			discriminator: [81, 148, 121, 71, 63, 166, 116, 24]
		},
		{
			name: 'vault'
			discriminator: [211, 8, 232, 43, 2, 152, 117, 119]
		}
	]
	errors: [
		{
			code: 6000
			name: 'InsufficientFunds'
			msg: 'Insufficient funds in vault'
		},
		{
			code: 6001
			name: 'FullRegistered'
			msg: 'Registration is full'
		},
		{
			code: 6002
			name: 'AlreadyRegistered'
			msg: 'Vault Already Registered'
		},
		{
			code: 6003
			name: 'WinnerDecided'
			msg: 'Winner decided'
		},
		{
			code: 6004
			name: 'OnLockPeriod'
			msg: 'On lock period'
		},
		{
			code: 6005
			name: 'OutsideLockPeriod'
			msg: 'Outside lock period'
		},
		{
			code: 6006
			name: 'InvalidLockPeriod'
			msg: 'Invalid lock period: end must be greater than start'
		},
		{
			code: 6007
			name: 'VaultAndSignerMismatch'
			msg: 'Vault and vault_as_signer must be the same address'
		},
		{
			code: 6008
			name: 'VaultFull'
			msg: 'Vault already full'
		},
		{
			code: 6009
			name: 'TooManyAmount'
			msg: 'Amount is too large try more small amount'
		},
		{
			code: 6010
			name: 'UnAuthorized'
			msg: 'UnAuthorized'
		},
		{
			code: 6011
			name: 'AlreadyDisqualified'
			msg: 'Already Disqulified'
		},
		{
			code: 6012
			name: 'FullDisqualified'
			msg: 'FullDisqualified'
		},
		{
			code: 6013
			name: 'BattleOnGoing'
			msg: 'Battle is On Going'
		},
		{
			code: 6014
			name: 'BattleNotEnded'
			msg: 'Battle Not ENd'
		}
	]
	types: [
		{
			name: 'battle'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'owner'
						type: 'pubkey'
					},
					{
						name: 'referee'
						type: 'pubkey'
					},
					{
						name: 'winner'
						type: {
							option: 'pubkey'
						}
					},
					{
						name: 'winnerTokenAccount'
						type: {
							option: 'pubkey'
						}
					},
					{
						name: 'treasuryTokenAccount'
						type: 'pubkey'
					},
					{
						name: 'participants'
						type: {
							array: ['pubkey', 10]
						}
					},
					{
						name: 'disqualified'
						type: {
							array: ['pubkey', 10]
						}
					},
					{
						name: 'startAt'
						type: 'i64'
					},
					{
						name: 'endAt'
						type: 'i64'
					},
					{
						name: 'bump'
						type: 'u8'
					}
				]
			}
		},
		{
			name: 'vault'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'manager'
						type: 'pubkey'
					},
					{
						name: 'owner'
						type: 'pubkey'
					},
					{
						name: 'tokenProgram'
						type: 'pubkey'
					},
					{
						name: 'vaultTokenAccount'
						type: 'pubkey'
					},
					{
						name: 'managerTokenAccount'
						type: 'pubkey'
					},
					{
						name: 'totalDeposits'
						type: 'u64'
					},
					{
						name: 'targetDeposits'
						type: 'u64'
					},
					{
						name: 'usedDeposits'
						type: 'u64'
					},
					{
						name: 'isOpenPosition'
						type: 'bool'
					},
					{
						name: 'bump'
						type: 'u8'
					}
				]
			}
		}
	]
}

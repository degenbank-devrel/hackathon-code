use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::jupiter_aggregator::program::Jupiter;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub manager: Pubkey,
    pub owner: Pubkey,
    pub token_program: Pubkey,
    pub vault_token_account: Pubkey,
    pub manager_token_account: Pubkey,
    pub total_deposits: u64,
    pub target_deposits: u64,
    pub used_deposits: u64,
    pub is_open_position: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Battle {
    pub owner: Pubkey,
    pub referee: Pubkey,
    pub winner: Option<Pubkey>,
    pub winner_token_account: Option<Pubkey>,
    pub treasury_token_account: Pubkey,
    pub participants: [Pubkey; 10],
    pub disqualified: [Pubkey; 10],
    pub start_at: i64,
    pub end_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
     /// CHECK: AMAN
    pub referee: AccountInfo<'info>,
    /// CHECK: AMAN
    pub treasury_token_account: AccountInfo<'info>,
    #[account(
      init,
      payer = authority,
      space = Battle::INIT_SPACE + (10 * 8) + (10 * 8) + (2 * 8), // Added 8 bytes for potential alignment
      seeds = [b"battle", referee.key().as_ref()],
      bump
    )]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CreateVault<'info> {
    /// CHECK: AMAN
    pub manager: AccountInfo<'info>,
    /// CHECK: AMAN
    pub manager_token_account: AccountInfo<'info>,
    #[account(
        init,
        payer = authority,
        space = Vault::INIT_SPACE + (9 * 8),
        seeds = [b"vault", manager.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,
    /// CHECK:
    pub vault_token_account: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub vault_winner: Account<'info, Vault>,
    /// CHECK:
    pub winner_token_account: AccountInfo<'info>,
    /// CHECK:
    pub winner_manager_token_account: AccountInfo<'info>,
    /// CHECK:
    pub manager_token_account: AccountInfo<'info>,
    /// CHECK:
    pub treasury_token_account: AccountInfo<'info>,
    /// CHECK:
    pub vault_token_account: AccountInfo<'info>,
    /// CHECK:
    pub vtoken_authority: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RegisterBattle<'info> {
  /// CHECK: AMAN
  #[account(mut)]
  pub vault: Account<'info, Vault>,
  /// CHECK: AMAN
  #[account(mut)]
  pub battle: Account<'info, Battle>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetBattlePeriod<'info> {
  /// CHECK: AMAN
  #[account(mut)]
  pub battle: Account<'info, Battle>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetBattleWinner<'info> {
  /// CHECK: AMAN
  #[account(mut)]
  pub winner_vault: Account<'info, Vault>,
  /// CHECK:
  pub winner_vault_token_account: AccountInfo<'info>,
  /// CHECK: AMAN
  #[account(mut)]
  pub battle: Account<'info, Battle>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetDisqulified<'info> {
  /// CHECK: AMAN
  #[account(mut)]
  pub vault: Account<'info, Vault>,
  /// CHECK: AMAN
  #[account(mut)]
  pub battle: Account<'info, Battle>,
  #[account(mut)]
  pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// CHECK: AMAN
    #[account(mut)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    /// CHECK:
    #[account(mut)]
    pub depositor_token_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub depositor_vtoken_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub vtoken_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub vault_token_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub vtoken_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// CHECK: AMAN
    #[account(mut)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    /// CHECK:
    #[account(mut)]
    pub vtoken_authority: AccountInfo<'info>,
    #[account(mut)]
    pub depositor: Signer<'info>,
    /// CHECK:
    #[account(mut)]
    pub depositor_token_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub depositor_vtoken_account: AccountInfo<'info>,
    /// CHECK:
    #[account(mut)]
    pub vtoken_account: Account<'info, Mint>,
    /// CHECK:
    #[account(mut)]
    pub vault_token_account: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}
#[derive(Accounts)]
pub struct Swap<'info> {
    /// CHECK: AMAN
    pub input_mint:  AccountInfo<'info>,
    /// CHECK: AMAN
    pub input_mint_program:  AccountInfo<'info>,
    /// CHECK: AMAN
    pub output_mint:  AccountInfo<'info>,
    /// CHECK: AMAN
    pub output_mint_program:  AccountInfo<'info>,

    /// CHECK: AMAN
    #[account(mut)]
    pub battle: Account<'info, Battle>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,
    
    /// CHECK: AMAN
    #[account(mut)]
    pub vault_input_token_account: AccountInfo<'info>,

    /// CHECK: AMAN
    #[account(mut)]
    pub vault_output_token_account:  AccountInfo<'info>,

    /// CHECK: Safe. user owner Account
    #[account(mut)]
    pub signer: Signer<'info>,

    pub jupiter_program: Program<'info, Jupiter>,
}
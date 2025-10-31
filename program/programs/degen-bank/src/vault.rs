use anchor_lang::prelude::*;
use anchor_spl::token::{MintTo, Burn};
use crate::context::*;
use crate::errors::ErrorCode;


pub fn create_vault(ctx: Context<CreateVault>, target: u64) -> Result<()> {
  let vault = &mut ctx.accounts.vault;
  vault.manager = ctx.accounts.manager.key();
  vault.owner = ctx.accounts.authority.key();
  vault.vault_token_account = ctx.accounts.vault_token_account.key();
  vault.token_program = ctx.accounts.token_program.key();
  vault.manager_token_account = ctx.accounts.manager_token_account.key();
  vault.total_deposits = 0;
  vault.target_deposits = target;
  vault.used_deposits = 0;
  vault.is_open_position = false;
  vault.bump = ctx.bumps.vault;

  Ok(())
}


pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
  let vault = &mut ctx.accounts.vault;
  let vault_winner = &mut ctx.accounts.vault_winner;
  let battle = &mut ctx.accounts.battle;

  // the owner is battle 
  if vault.owner != ctx.accounts.authority.key() {
      return Err(ErrorCode::UnAuthorized.into());
  }

  if battle.winner.is_none(){
    return Err(ErrorCode::BattleNotEnded.into());
  }

  if vault_winner.key() != battle.winner.unwrap() {
    return Err(ErrorCode::UnAuthorized.into());
  }

  let manager = vault.manager_token_account;
  let winner_manager =  vault_winner.manager_token_account;
  let winner = vault_winner.vault_token_account;
  let treasury = battle.treasury_token_account;

  if manager != ctx.accounts.manager_token_account.key()
    || winner != ctx.accounts.winner_token_account.key()
    || winner_manager != ctx.accounts.winner_manager_token_account.key()
    || treasury != ctx.accounts.treasury_token_account.key() {
    return Err(ErrorCode::UnAuthorized.into());
  }


  let seeds = &[
      b"vault",
      vault.manager.as_ref(),
      &[vault.bump],
  ];
  let signer_seeds = &[&seeds[..]];


  let amount = anchor_spl::token::accessor::amount(&ctx.accounts.vault_token_account)?;

  if amount > vault.total_deposits {
    let remaining_amount = amount - vault.total_deposits;
    let winner_share = remaining_amount * 75 / 100;
    let manager_share = remaining_amount * 10 / 100;
    let winner_manager_share = remaining_amount * 10 / 100;
    let treasury_share = remaining_amount * 5 / 100;
    // Transfer to winner
    let transfer_to_winner = anchor_spl::token::Transfer {
      from: ctx.accounts.vault_token_account.to_account_info(),
      to: ctx.accounts.winner_token_account.to_account_info(),
      authority: ctx.accounts.vtoken_authority.to_account_info(),
    };
    anchor_spl::token::transfer(
      CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_winner,
        signer_seeds,
      ),
      winner_share,
    )?;

    // Transfer to winning manager
    let transfer_to_winner_manager = anchor_spl::token::Transfer {
      from: ctx.accounts.vault_token_account.to_account_info(),
      to: ctx.accounts.winner_manager_token_account.to_account_info(),
      authority: ctx.accounts.vtoken_authority.to_account_info(),
    };
    anchor_spl::token::transfer(
      CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_winner_manager,
        signer_seeds,
      ),
      winner_manager_share,
    )?;

    // Transfer to manager
    let transfer_to_manager = anchor_spl::token::Transfer {
      from: ctx.accounts.vault_token_account.to_account_info(),
      to: ctx.accounts.manager_token_account.to_account_info(),
      authority: ctx.accounts.vtoken_authority.to_account_info(),
    };
    anchor_spl::token::transfer(
      CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_manager,
        signer_seeds,
      ),
      manager_share,
    )?;

    // Transfer to treasury
    let transfer_to_treasury = anchor_spl::token::Transfer {
      from: ctx.accounts.vault_token_account.to_account_info(),
      to: ctx.accounts.treasury_token_account.to_account_info(),
      authority: ctx.accounts.vtoken_authority.to_account_info(),
    };
    anchor_spl::token::transfer(
      CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_to_treasury,
        signer_seeds,
      ),
      treasury_share,
    )?;
  }

  vault.is_open_position = false;

  Ok(())
}

pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
  let vault = &mut ctx.accounts.vault;
  let battle = &mut ctx.accounts.battle;
  let clock = Clock::get()?;

  if clock.unix_timestamp > battle.start_at && clock.unix_timestamp < battle.end_at {
    return Err(ErrorCode::OnLockPeriod.into());
  }

  if vault.total_deposits >= vault.target_deposits {
      return Err(ErrorCode::VaultFull.into());
  }

  let balance_after = vault.total_deposits + amount;

  if balance_after >= vault.target_deposits{
     return Err(ErrorCode::TooManyAmount.into());
  }

  let transfer_ix = anchor_spl::token::Transfer {
      from: ctx.accounts.depositor_token_account.to_account_info(),
      to: ctx.accounts.vault_token_account.to_account_info(),
      authority: ctx.accounts.depositor.to_account_info(),
  };

  anchor_spl::token::transfer(
      CpiContext::new(
          ctx.accounts.token_program.to_account_info(),
          transfer_ix,
      ),
      amount,
  )?;

  let mint_ix = MintTo {
      mint: ctx.accounts.vtoken_account.to_account_info(),
      to: ctx.accounts.depositor_vtoken_account.to_account_info(),
      authority: ctx.accounts.vtoken_authority.to_account_info(),
  };

  let seeds = &[
      b"vault",
      vault.manager.as_ref(),
      &[vault.bump],
  ];
  let signer_seeds = &[&seeds[..]];
  anchor_spl::token::mint_to(
      CpiContext::new_with_signer(
          ctx.accounts.token_program.to_account_info(),
          mint_ix,
          signer_seeds,
      ),
      amount,
  )?;

  vault.total_deposits += amount;
  Ok(())
}

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
  let vault = &mut ctx.accounts.vault;
  let battle = &mut ctx.accounts.battle;
  let clock = Clock::get()?;

  if clock.unix_timestamp > battle.start_at && clock.unix_timestamp < battle.end_at {
    return Err(ErrorCode::OnLockPeriod.into());
  }

  let depositor_vtoken_balance = anchor_spl::token::accessor::amount(&ctx.accounts.depositor_vtoken_account)?;
  if amount > depositor_vtoken_balance {
      return Err(ErrorCode::InsufficientFunds.into());
  }

  let burn_ix = Burn {
      mint: ctx.accounts.vtoken_account.to_account_info(),
      from: ctx.accounts.depositor_vtoken_account.to_account_info(),
      authority: ctx.accounts.depositor.to_account_info(),
  };

  anchor_spl::token::burn(
      CpiContext::new(
          ctx.accounts.token_program.to_account_info(),
          burn_ix,
      ),
      amount,
  )?;

  let vault_token_balance = anchor_spl::token::accessor::amount(&ctx.accounts.vault_token_account)?;
  if amount > vault_token_balance {
      return Err(ErrorCode::InsufficientFunds.into());
  }


  let supply = ctx.accounts.vtoken_account.supply;
  let withdrawal_amount = amount * vault_token_balance / supply;

  let seeds = &[
      b"vault",
      vault.manager.as_ref(),
      &[vault.bump],
  ];
  let signer_seeds = &[&seeds[..]];

  let transfer_ix = anchor_spl::token::Transfer {
      from: ctx.accounts.vault_token_account.to_account_info(),
      to: ctx.accounts.depositor_token_account.to_account_info(),
      authority: ctx.accounts.vtoken_authority.to_account_info(),
  };

  anchor_spl::token::transfer(
      CpiContext::new_with_signer(
          ctx.accounts.token_program.to_account_info(),
          transfer_ix,
          signer_seeds,
      ),
      withdrawal_amount,
  )?;

  vault.total_deposits -= amount;
  Ok(())
}
use anchor_lang::prelude::*;
use crate::context::*;
use crate::errors::ErrorCode;

pub fn initialize(ctx: Context<Initialize>, start_at: i64, end_at: i64) -> Result<()> {
  let battle = &mut ctx.accounts.battle;
  battle.owner = ctx.accounts.authority.key();
  battle.referee = ctx.accounts.referee.key();
  battle.treasury_token_account = ctx.accounts.treasury_token_account.key();
  battle.start_at = start_at;
  battle.end_at = end_at;
  battle.participants = [Pubkey::default(); 10];
  battle.disqualified = [Pubkey::default(); 10];
  battle.bump = ctx.bumps.battle;

  Ok(())
}

pub fn register_vault(ctx: Context<RegisterBattle>) -> Result<()> {
  let battle = &mut ctx.accounts.battle;

  if battle.owner != ctx.accounts.authority.key() {
      return Err(ErrorCode::UnAuthorized.into());
  }

  let registered = battle.participants.iter().filter(|&p| *p != Pubkey::default()).collect::<Vec<_>>();

  if registered.len() >= 10 {
    return Err(ErrorCode::FullRegistered.into());
  }

  if battle.participants.contains(&ctx.accounts.vault.key()) {
      return Err(ErrorCode::AlreadyRegistered.into());
  }

  if let Some(index) = battle.participants.iter().position(|&p| p == Pubkey::default()) {
      battle.participants[index] = ctx.accounts.vault.key();
  }

  Ok(())
}

pub fn set_winner(ctx: Context<SetBattleWinner>) -> Result<()> {
  let battle = &mut ctx.accounts.battle;
  let clock = Clock::get()?;

  if battle.owner != ctx.accounts.authority.key() && battle.referee != ctx.accounts.authority.key() {
      return Err(ErrorCode::UnAuthorized.into());
  }

  if clock.unix_timestamp < battle.end_at {
     return Err(ErrorCode::BattleOnGoing.into());
  }

 if battle.winner.is_some() {
   return Err(ErrorCode::WinnerDecided.into());
 }

 battle.winner = Some(ctx.accounts.winner_vault.key());
 battle.winner_token_account = Some(ctx.accounts.winner_vault_token_account.key());

 Ok(())
}


pub fn disqualified(ctx: Context<SetDisqulified>) -> Result<()> {
  let battle = &mut ctx.accounts.battle;

  if battle.owner != ctx.accounts.authority.key() && battle.referee != ctx.accounts.authority.key() {
      return Err(ErrorCode::UnAuthorized.into());
  }

  if battle.winner.is_some() {
      return Err(ErrorCode::WinnerDecided.into());
  }

  if battle.disqualified.contains(&ctx.accounts.vault.key()) {
      return Err(ErrorCode::AlreadyDisqualified.into());
  }

  if let Some(index) = battle.disqualified.iter().position(|&p| p == Pubkey::default()) {
      battle.disqualified[index] = ctx.accounts.vault.key();
  } else {
      return Err(ErrorCode::FullDisqualified.into());
  }

  Ok(())
}

pub fn set_battle_period(ctx: Context<SetBattlePeriod>, start_at: i64, end_at: i64) -> Result<()> {
  let battle = &mut ctx.accounts.battle;

  if battle.owner != ctx.accounts.authority.key() && battle.referee != ctx.accounts.authority.key() {
      return Err(ErrorCode::UnAuthorized.into());
  }

  battle.start_at = start_at;
  battle.end_at = end_at;

  Ok(())
}
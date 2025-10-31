
use anchor_lang::{
    prelude::*,
    solana_program::{instruction::Instruction, program::invoke_signed},
};

use std::str::FromStr;
use crate::context::*;
use crate::errors::ErrorCode;

pub fn jupiter_program_id() -> Pubkey {
    Pubkey::from_str("JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4").unwrap()
}



pub fn swap(ctx: Context<Swap>, data: Vec<u8>) -> Result<()> {
      require_keys_eq!(*ctx.accounts.jupiter_program.key, jupiter_program_id());

      let vault = &ctx.accounts.vault;
      let battle = &ctx.accounts.battle;
      let clock = Clock::get()?;

      if clock.unix_timestamp < battle.start_at && clock.unix_timestamp > battle.end_at {
        return Err(ErrorCode::OutsideLockPeriod.into());
      }

      if vault.manager != ctx.accounts.signer.key() || battle.owner != ctx.accounts.signer.key()  {
        return Err(ErrorCode::UnAuthorized.into());
      }


      let accounts: Vec<AccountMeta> = ctx
          .remaining_accounts
          .iter()
          .map(|acc| {
              let is_signer = acc.key == &ctx.accounts.vault.key();
              AccountMeta {
                  pubkey: *acc.key,
                  is_signer,
                  is_writable: acc.is_writable,
              }
          })
          .collect();

      let accounts_infos: Vec<AccountInfo> = ctx
          .remaining_accounts
          .iter()
          .map(|acc| AccountInfo { ..acc.clone() })
          .collect();

      let seeds = &[
          b"vault",
          vault.manager.as_ref(),
          &[vault.bump],
      ];
      let signer_seeds = &[&seeds[..]];

      invoke_signed(
          &Instruction {
              program_id: ctx.accounts.jupiter_program.key(),
              accounts,
              data,
          },
          &accounts_infos,
          signer_seeds,
      )?;

      Ok(())
    }
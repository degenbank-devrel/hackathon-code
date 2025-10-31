
use anchor_lang::prelude::*;

declare_id!("GoXfRMXGPgf91TSUViswPtnfEbTj4c9D6uqJe3VcPx6q");

declare_program!(jupiter_aggregator);

pub mod context;
pub mod external;
pub mod jupiter;
pub mod errors;
pub mod vault;
pub mod battle;

pub use context::*;
#[program]
pub mod degen_bank {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, start_at: i64, end_at: i64) -> Result<()> {
        battle::initialize(ctx, start_at, end_at)
    }
    pub fn set_winner(ctx: Context<SetBattleWinner>) -> Result<()> {
        battle::set_winner(ctx)
    }

    pub fn set_battle_period(ctx: Context<SetBattlePeriod>, start_at: i64, end_at: i64) -> Result<()> {
        battle::set_battle_period(ctx, start_at, end_at)
    }

     pub fn register_vault(ctx: Context<RegisterBattle>) -> Result<()> {
        battle::register_vault(ctx)
    }
    pub fn create_vault(ctx: Context<CreateVault>, target: u64) -> Result<()> {
        vault::create_vault(ctx, target)
    }

    pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
        vault::close_vault(ctx)
    }

    pub fn disqualified(ctx: Context<SetDisqulified>) -> Result<()> {
        battle::disqualified(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        vault::deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        vault::withdraw(ctx, amount)
    }

   pub fn swap(ctx: Context<Swap>, data: Vec<u8>) -> Result<()> {
        jupiter::swap(ctx, data)
   }
}

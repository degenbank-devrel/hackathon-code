use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
    #[msg("Registration is full")]
    FullRegistered,
    #[msg("Vault Already Registered")]
    AlreadyRegistered,
    #[msg("Winner decided")]
    WinnerDecided,
    #[msg("On lock period")]
    OnLockPeriod,
    #[msg("Outside lock period")]
    OutsideLockPeriod,
    #[msg("Invalid lock period: end must be greater than start")]
    InvalidLockPeriod,
    #[msg("Vault and vault_as_signer must be the same address")]
    VaultAndSignerMismatch,
    #[msg("Vault already full")]
    VaultFull,
    #[msg("Amount is too large try more small amount")]
    TooManyAmount,
    #[msg("UnAuthorized")]
    UnAuthorized,
    #[msg("Already Disqulified")]
    AlreadyDisqualified,
    #[msg("FullDisqualified")]
    FullDisqualified,
    #[msg("Battle is On Going")]
    BattleOnGoing,
    #[msg("Battle Not ENd")]
    BattleNotEnded,
}
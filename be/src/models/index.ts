import { Balance } from './balance.model';
import { Battle } from './battle.model';
import { Comment } from './comment.model';
import { Manager } from './manager.model';
import { Price } from './price.model';
import { Token } from './token.model';
import { User } from './user.model';
import { UserVaultPosition } from './user-vault-position.model';
import { Vault } from './vault.model';
import { VaultBalance } from './vaultbalance.model';
import { WebhookTx } from './webhooktxs.model';
import { UserTxHistory } from './usertxhistory.model';
import { VaultAnalytic } from './vaultanalytics.model';

const models = [
  User,
  Battle,
  Balance,
  Manager,
  Vault,
  UserVaultPosition,
  Comment,
  Token,
  WebhookTx,
  VaultBalance,
  Price,
  UserTxHistory,
  VaultAnalytic,
];

export default models;

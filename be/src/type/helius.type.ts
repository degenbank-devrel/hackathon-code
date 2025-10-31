export interface HeliusTxData {
  signature: string;
  type: string;
  tokenTransfers: HeliusTokenTransfer[];
  instructions: HeliusInstruction[];
  fee: number;
  timestamp: number;
}

export interface HeliusInstruction {
  accounts: string[];
  programId: string;
  data: string;
}

export interface HeliusTokenTransfer {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
}

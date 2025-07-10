export interface DecodedJwt {
  userId: number;
  email: string;
}

export enum PaymentMethod {
  CARD = 'CARD',
  VBANK = 'VBANK',
}

export enum BankCode {
  KB = 'KB',
  NH = 'NH',
  SH = 'SH',
  IBK = 'IBK',
  TOSS = 'TOSS',
}

export interface CardExtra {
  type: 'card';
  expMonth: string;
  expYear: string;
}
export interface VirtualAccountExtra {
  type: 'vbank';
  owner: string;
}
export type Extra = CardExtra | VirtualAccountExtra;

export interface PaymentInfo {
  method: PaymentMethod;
  bank: BankCode;
  token: string;
  masked: string;
  extra: Extra;
}

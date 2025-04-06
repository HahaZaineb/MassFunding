import { Args, bytesToString, NoArg, Result, Serializable } from '@massalabs/as-types';
import { Address, call } from '@massalabs/massa-as-sdk';
import { MRC20Wrapper } from '@massalabs/sc-standards/assembly/contracts/MRC20/wrapper';
import { u256 } from 'as-bignum/assembly';

export class IMRC20 extends MRC20Wrapper implements Serializable {
  constructor(origin: Address = new Address()) {
    super(origin);
  }

  // Override transferFrom with the same signature as in the base class.
  public transferFrom(
    ownerAccount: Address,
    recipientAccount: Address,
    nbTokens: u256,
    coins: number = 0
  ): void {
    const args = new Args()
      .add(ownerAccount)
      .add(recipientAccount)
      .add(nbTokens);
    call(this._origin, 'transferFrom', args, coins);
  }

  // Similarly, override transfer
  public transfer(
    recipientAccount: Address,
    nbTokens: u256,
    coins: number = 0
  ): void {
    const args = new Args()
      .add(recipientAccount)
      .add(nbTokens);
    call(this._origin, 'transfer', args, coins);
  }

  // Existing methods
  initExtended(
    owner: Address,
    name: string,
    symbol: string,
    decimals: u8,
    supply: u256,
    image: string,
    website: string,
    description: string,
    pausable: bool,
    mintable: bool,
    burnable: bool,
    coins: u64 = 0,
  ): void {
    const args = new Args()
      .add(owner)
      .add(name)
      .add(symbol)
      .add(decimals)
      .add(supply)
      .add(image)
      .add(website)
      .add(description)
      .add(pausable)
      .add(mintable)
      .add(burnable);

    call(this._origin, 'constructor', args, coins);
  }

  image(): string {
    return bytesToString(call(this._origin, 'image', NoArg, 0));
  }

  website(): string {
    return bytesToString(call(this._origin, 'website', NoArg, 0));
  }

  description(): string {
    return bytesToString(call(this._origin, 'description', new Args(), 0));
  }

  serialize(): StaticArray<u8> {
    return this._origin.serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    return this._origin.deserialize(data, offset);
  }
}

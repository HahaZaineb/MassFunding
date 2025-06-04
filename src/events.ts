import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';

dotenv.config();

const account = await Account.fromEnv('PRIVATE_KEY');
const provider = Web3Provider.buildnet(account);

console.log('getting events');

const events = await provider.getEvents({
  smartContractAddress: "AS12evxNm1RaW58nyn7a5DPDhimPWCnN2ky2Zb1nmLyPGdjfbUYUQ",
});

for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Done');
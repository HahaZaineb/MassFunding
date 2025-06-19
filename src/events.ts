import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';

dotenv.config();

const account = await Account.fromEnv('PRIVATE_KEY');
const provider = Web3Provider.buildnet(account);

console.log('getting events');

const events = await provider.getEvents({
  smartContractAddress: "AS12PCkuKpveFcfxbB3fUGTEsuvfFEuSBEiLXA9Z2m5FWpT1w5idy",
});

for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Done');
import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';

dotenv.config();

const account = await Account.fromEnv('PRIVATE_KEY');
const provider = Web3Provider.buildnet(account);

console.log('getting events');

const events = await provider.getEvents({
  smartContractAddress: "AS12kVo9YE6hTTDGZsWeDY99cpvkWwQnXTnPr7Tfdt683SUQKZUxw",
});

for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Done');
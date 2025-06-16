import { Account, Web3Provider } from '@massalabs/massa-web3';
import * as dotenv from 'dotenv';

dotenv.config();

const account = await Account.fromEnv('PRIVATE_KEY');
const provider = Web3Provider.buildnet(account);

console.log('getting events');

const events = await provider.getEvents({
  smartContractAddress: "AS19pHPwHQATQyYpAuNwf4jS6JonLvpKvWnNzx8gfk8kvrH69toq",
});

for (const event of events) {
  console.log('Event message:', event.data);
}

console.log('Done');
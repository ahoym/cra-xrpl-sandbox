import { logMessageAndPass } from '../../utilities';
import {
  generateDevNetXrplClient,
  xrplDevNetClient1,
  xrplDevNetClient2,
} from '../createClients';
import {
  createTrustSetForReceiver,
  ISSUED_CURENCY_TOKEN,
} from './createTrustSetForReceiver';

console.log('========🪙 Create Tri Address Unit script 🪙========');

/**
Script to create functional tri-address unit as outlined in:
https://xrpl.org/issuing-and-operational-addresses.html

Nomenclature:
- Issuing address (cold) - xrplClient1 🥶
- Standby address (warm) - xrpClient2 😐
- Operational address (hot) - xrpClient3 🔥
*/

const xrplDevNetClient3 = generateDevNetXrplClient();

// 1a. Create Trust set from Standby address (warm) to Issuing Address (cold)
const standbyToIssuingTrustlinePromise = createTrustSetForReceiver({
  issuerClient: xrplDevNetClient1,
  issuerClientSecret: 'snVKpuNscB3RYzRbK7pL2W5kjM5Zo',
  receiverClient: xrplDevNetClient2,
  receiverClientSecret: 'shjw6wdSdcMNRBC4mWP3nW7hMQ8pH',
});

// 1b. Create Trust set from Operational address (hot) to Issuing Address (cold)
const operationalToIssuingTrustlinePromise = createTrustSetForReceiver({
  issuerClient: xrplDevNetClient1,
  issuerClientSecret: 'snVKpuNscB3RYzRbK7pL2W5kjM5Zo',
  receiverClient: xrplDevNetClient3,
  receiverClientSecret: 'spiPmtqDxNfwuhFSux5Hj6a4ih83W',
});

// 2. Issue tokens to Standby (warm) address

// 3. Refill tokens to Operational address
// 4. Credit tokens to participants

Promise.all([
  standbyToIssuingTrustlinePromise,
  operationalToIssuingTrustlinePromise,
])
  .then(logMessageAndPass('Created both Trustlines to Issuing address'))
  .then(
    async ([
      [issuingClient1, standbyClient],
      [issuingClient2, operationalClient],
    ]) => {
      console.log(
        `🥶 Issuing client address ${issuingClient1.wallet()!.address}`
      );
      console.log(
        `🥶 Issuing client address ${issuingClient2.wallet()!.address}`
      );
      console.log(
        `😐 Standby client address ${standbyClient.wallet()!.address}`
      );
      console.log(
        `🔥 Operational client address ${operationalClient.wallet()!.address}`
      );

      await issuingClient2.sendPayment(
        {
          currency: ISSUED_CURENCY_TOKEN,
          issuer: issuingClient2.wallet()!.address,
          value: '10000',
        },
        operationalClient.wallet()!.address
      );
      return [issuingClient2, operationalClient];
    }
  )
  .then(
    logMessageAndPass(
      `Sent Issued Currency ${ISSUED_CURENCY_TOKEN} to Receiver`
    )
  );

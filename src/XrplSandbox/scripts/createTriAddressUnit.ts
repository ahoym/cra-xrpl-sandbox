import { AccountSetAsfFlags } from 'xrpl';
import { logMessageAndPass } from '../../utilities';
import {
  generateTestnetXrplClient,
  xrplClient1,
  xrplClient2,
} from '../createClients';
import {
  createTrustSetForReceiver,
  ISSUED_CURENCY_TOKEN,
} from './createTrustSetForReceiver';
import { generateWallet } from './generateWallet';

console.log('========🪙 Create Tri Address Unit script 🪙========');

/**
Script to create functional tri-address unit as outlined in:
https://xrpl.org/issuing-and-operational-addresses.html

Nomenclature:
- Issuing address (cold) - xrplClient1 🥶
- Standby address (warm) - xrpClient2 😐
- Operational address (hot) - xrpClient3 🔥

General flow:

1a. Create Trust set from Standby address (warm) to Issuing Address (cold)
1b. Create Trust set from Operational address (hot) to Issuing Address (cold)
2. Issue tokens to Standby (warm) address
3. Refill tokens to Operational address
4. Credit tokens to participants

# TODO Authorized trustlines (both sides need to send TrustSet to each other)
*/

const xrplClient3 = generateTestnetXrplClient();
(window as any).xrplClient3 = xrplClient3;

// Testnet secrets from the faucet
const CLIENT1_SECRET = '';
const CLIENT2_SECRET = '';
const CLIENT3_SECRET = '';
const CLIENT4_SECRET = '';

// 1a. Create Trust set from Standby address (warm) to Issuing Address (cold)
const standbyToIssuingTrustlinePromise = createTrustSetForReceiver({
  issuerClient: xrplClient1,
  issuerClientSecret: CLIENT1_SECRET,
  receiverClient: xrplClient2,
  receiverClientSecret: CLIENT2_SECRET,
});

const setRipplingForIssuerProcedure = generateWallet(xrplClient1, {
  clientDescription: 'Issuer',
  fromSeed: CLIENT1_SECRET,
})
  .then(() =>
    xrplClient1.setAccount({ SetFlag: AccountSetAsfFlags.asfDefaultRipple })
  )
  .then(logMessageAndPass('Set default rippling for Issuer Client'));

// 1b. Create Trust set from Operational address (hot) to Issuing Address (cold)
const operationalToIssuingTrustlinePromise = createTrustSetForReceiver({
  issuerClient: xrplClient1,
  issuerClientSecret: CLIENT1_SECRET,
  receiverClient: xrplClient3,
  receiverClientSecret: CLIENT3_SECRET,
});

const triAddressSetupProcedure = setRipplingForIssuerProcedure
  .then(() =>
    Promise.all([
      standbyToIssuingTrustlinePromise,
      operationalToIssuingTrustlinePromise,
    ])
  )
  .then(logMessageAndPass('Created both Trustlines to Issuing address'))
  .then(
    ([
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
      return [issuingClient1, standbyClient, operationalClient];
    }
  )
  .then(async ([issuingClient, standbyClient, operationalClient]) => {
    // 2. Issue tokens to Standby (warm) address
    await issuingClient.sendPayment(
      {
        currency: ISSUED_CURENCY_TOKEN,
        issuer: issuingClient.wallet()!.address,
        value: '5000',
      },
      standbyClient.wallet()!.address
    );
    return [issuingClient, standbyClient, operationalClient];
  })
  .then(
    logMessageAndPass(
      `Issued Currency ${ISSUED_CURENCY_TOKEN} to Standby client`
    )
  )
  // 3. Refill tokens to Operational address
  .then(async ([issuingClient, standbyClient, operationalClient]) => {
    console.log(
      'Step 3, refilling tokens from Standby client to Operational client'
    );

    await standbyClient.sendPayment(
      {
        currency: ISSUED_CURENCY_TOKEN,
        issuer: issuingClient.wallet()!.address,
        value: '500',
      },
      operationalClient.wallet()!.address
    );

    return [issuingClient, standbyClient, operationalClient];
  })
  .then(
    logMessageAndPass(
      `Sent ${ISSUED_CURENCY_TOKEN} from Standby client to Operational client`
    )
  );

const xrplClient4 = generateTestnetXrplClient();
(window as any).xrplClient4 = xrplClient4;

// 4 Customer creates trust set to Issuer
const customerToIssuingTrustlinePromise = createTrustSetForReceiver({
  issuerClient: xrplClient1,
  issuerClientSecret: CLIENT1_SECRET,
  receiverClient: xrplClient4,
  receiverClientSecret: CLIENT4_SECRET,
});

triAddressSetupProcedure
  .then(async ([issuingClient, standbyClient, operationalClient]) => {
    const [, customerClient] = await customerToIssuingTrustlinePromise;
    console.log(
      `🤑 Customer client address ${customerClient.wallet()!.address}`
    );
    return [issuingClient, standbyClient, operationalClient, customerClient];
  })
  .then(
    logMessageAndPass('Step 4. Create Trustline between Customer and Issuer')
  )
  // 5. Credit tokens from Operational client to Customer
  .then(
    async ([
      issuingClient,
      standbyClient,
      operationalClient,
      customerClient,
    ]) => {
      await operationalClient.sendPayment(
        {
          currency: ISSUED_CURENCY_TOKEN,
          issuer: issuingClient.wallet()!.address,
          value: '200',
        },
        customerClient.wallet()!.address
      );
      return [issuingClient, standbyClient, operationalClient, customerClient];
    }
  )
  .then(
    logMessageAndPass(
      'Step 5. Credited tokens from Operational Client to Customer'
    )
  )
  // 6. Redeem/"Burn" tokens by sending back to Issuing address
  .then(
    async ([
      issuingClient,
      standbyClient,
      operationalClient,
      customerClient,
    ]) => {
      await customerClient.sendPayment(
        {
          currency: ISSUED_CURENCY_TOKEN,
          issuer: issuingClient.wallet()!.address,
          value: '10',
        },
        issuingClient.wallet()!.address
      );
    }
  )
  .then(logMessageAndPass('Step 6. Redeem tokens from Customer to Issuer'));

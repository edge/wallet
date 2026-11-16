<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# Wallet

The web wallet of the XE Blockchain.

## Edge Connect

Sites open `/connect` in a popup and exchange Edge Connect v1 messages using
`postMessage`. The wallet accepts requests only from its opener, shows the
browser-reported site origin and replies to that exact origin. HTTPS sites and
HTTP loopback sites are supported. Serve `/connect` without a
`Cross-Origin-Opener-Policy` header so the opener remains available.

- `edge_requestAccounts`, with `{ network: "mainnet" | "testnet" }`, asks the
  user to unlock and select an existing account. It returns its address,
  network, micro-EDGE balance and next nonce, never a key or password.
- `edge_sendTransaction`, with `{ from, recipient, amount, data?: { memo?, ref? } }`,
  requires that origin to be connected to `from`. The user reviews and approves
  each transfer with their password. Addresses must have their canonical case;
  the positive integer amount is in micro-EDGE; memo and reference each allow
  at most 64 characters. Other transaction actions are rejected.

Burn transfers require an explicit destruction acknowledgement. The request
does not prove which XE address its reference pays; the review says so.
Permission is stored per site origin and network; wallet storage is unchanged.
Account creation and private-key import stay in the wallet's existing screens.

Closing before submission returns error `4001`. If submission may have occurred,
error `-32603` includes `uncertain: true` and the locally computed transaction
`hash`. Callers must retain the claim reference and check that transaction before
offering another send. A popup that disappears without answering after a send
request must also be treated as uncertain.

## System Requirements

- Node.js v16+

## Contributing

Interested in contributing to the project? Amazing! Before you do, please have a quick look at our [Contributor Guidelines](CONTRIBUTING.md) where we've got a few tips to help you get started.

## License

Edge is the infrastructure of Web3. A peer-to-peer network and blockchain providing high performance decentralised web services, powered by the spare capacity all around us.

Copyright notice
(C) 2021 Edge Network Technologies Limited <support@edge.network><br />
All rights reserved

This product is part of Edge.
Edge is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version ("the GPL").

**If you wish to use Edge outside the scope of the GPL, please contact us at licensing@edge.network for details of alternative license arrangements.**

**This product may be distributed alongside other components available under different licenses (which may not be GPL). See those components themselves, or the documentation accompanying them, to determine what licenses are applicable.**

Edge is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

The GNU General Public License (GPL) is available at: https://www.gnu.org/licenses/gpl-3.0.en.html<br />
A copy can be found in the file GPL.md distributed with
these files.

This copyright notice MUST APPEAR in all copies of the product!

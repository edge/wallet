<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# Wallet

The web wallet of the XE Blockchain.

## System Requirements

- Node.js v16+

## Contributing

Interested in contributing to the project? Amazing! Before you do, please have a quick look at our [Contributor Guidelines](CONTRIBUTING.md) where we've got a few tips to help you get started.

## Ethereum EDGE claims

The Ethereum claim entry is disabled by default. To test it, set
`VITE_ETHEREUM_CLAIMS_API_URL` to the Ethereum routes of `edge/xe-claim`, for example
`http://127.0.0.1:18100/ethereum`, and run `npm run dev`. Remote service URLs must
use HTTPS. Docker builds use the optional `ETHEREUM_CLAIMS_API_URL` build argument.

The claims backend must have Ethereum support configured. The wallet checks the
network and the pinned deployed EDGE contract bytecode before sending. Supported
networks are Ethereum mainnet and an isolated local chain (31337) using that same
runtime. Add the local network to the browser wallet before connecting. Test EDGE
and ETH funding belongs to the local chain setup, outside the wallet UI.

The flow connects the wallet, collects an XE address and amount, then shows a
review before requesting a token transfer. The transfer appends `XEC1` and a
32-byte reference to the ERC-20 calldata. The service binds that reference to the
claim details and reports receipt status. The XE destination stays private in the
backend; the frontend retains its own copy for review and reload recovery.
Rejected transfers can be reviewed again with the same reference. The service
observes deposits independently of the browser; no transaction-hash callback is
needed. Amounts retain six-decimal claim precision and use Ethereum's 18-decimal
base units on the wire.

This requires the matching Ethereum extension in `xe-claim`. A received claim
still needs approval and a separate XE payout process, just like a native claim.
Local chain 31337 is explicitly labelled as a rehearsal and pays no native XE.

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

// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { ethers } from 'ethers'

export const ethereumClaimsEnabled = () => !!import.meta.env.VITE_ETHEREUM_CLAIMS_API_URL
export const ethereumClaimStorageKey = () => `ethereum-claim:${import.meta.env.VITE_ETHEREUM_CLAIMS_API_URL}`
export const ethereumBurnAddress = '0x000000000000000000000000000000000000dEaD'
const edgeToken = '0x4ec1b60b96193a64acae44778e51f7bff2007831'
const edgeCodeHash = '0x5b912c55e41475c2a0d9c46ad3c923f2ce4b2dca84697721de0ba63738c56b3b'
const token = new ethers.utils.Interface(['function transfer(address recipient, uint256 amount) returns (bool)'])
const referencePattern = /^[0-9a-f]{64}$/

export function parseClaimAmount(value) {
  const text = value.trim()
  if (!/^\d+(\.\d{1,6})?$/.test(text)) throw new Error('Enter an amount with up to six decimal places.')
  const amount = ethers.utils.parseUnits(text, 18)
  if (amount.isZero()) throw new Error('Enter an amount greater than zero.')
  return amount
}

export function encodeClaimTransfer(claim) {
  if (claim.claimsAddress?.toLowerCase() !== ethereumBurnAddress.toLowerCase()) throw new Error('Invalid Ethereum burn address.')
  if (!referencePattern.test(claim.ref)) throw new Error('Invalid claim reference.')
  return token.encodeFunctionData('transfer', [claim.claimsAddress, claim.amount]) + '58454331' + claim.ref
}

function isLoopback(value) {
  const url = new URL(value)
  return ['http:', 'https:'].includes(url.protocol) && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
}

export function validateEthereumInfo(info) {
  if (!['0x1', '0x7a69'].includes(info.chainId) || info.rehearsal !== (info.chainId === '0x7a69')) {
    throw new Error('Unsupported Ethereum claims network.')
  }
  if (info.tokenAddress?.toLowerCase() !== edgeToken || info.tokenCodeHash !== edgeCodeHash ||
      info.claimsAddress?.toLowerCase() !== ethereumBurnAddress.toLowerCase() ||
      !/^[1-9][0-9]*$/.test(info.minAmount) || !Number.isSafeInteger(info.confirmations) || info.confirmations < 1) {
    throw new Error('Invalid Ethereum claims configuration.')
  }
}

export function validateClaim(claim, info, request) {
  if (!ethers.utils.isAddress(request.ethereumAddress) || !referencePattern.test(request.xeAddress) || /^0+$/.test(request.xeAddress) ||
      !/^[1-9][0-9]*$/.test(request.amount) || ethers.BigNumber.from(request.amount).gt(ethers.constants.MaxUint256)) {
    throw new Error('Invalid claim details.')
  }
  validateEthereumInfo(info)
  const matches = claim.chainId === info.chainId &&
    claim.tokenAddress?.toLowerCase() === info.tokenAddress.toLowerCase() &&
    claim.claimsAddress?.toLowerCase() === info.claimsAddress.toLowerCase() &&
    claim.ethereumAddress?.toLowerCase() === request.ethereumAddress.toLowerCase() &&
    (claim.xeAddress === undefined || claim.xeAddress === request.xeAddress) && claim.amount === request.amount
  if (!matches) throw new Error('The pending claim does not match your transfer details.')
  if (!referencePattern.test(claim.ref)) throw new Error('Invalid claim reference.')
  if (request.ref && claim.ref !== request.ref) throw new Error('The claim reference does not match the pending claim.')
}

export async function ethereumClaimsRequest(path, options = {}) {
  const base = import.meta.env.VITE_ETHEREUM_CLAIMS_API_URL
  if (!base) throw new Error('Configure the Ethereum claims service first.')
  const url = new URL(base)
  if ((url.protocol !== 'https:' && !isLoopback(base)) || url.username || url.password || url.search || url.hash) {
    throw new Error('The claims service must use HTTPS or a loopback URL.')
  }
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json' }
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Claims service error (HTTP ${res.status}).`)
  return body
}

export function claimBalanceText(value) {
  return ethers.utils.formatUnits(ethers.BigNumber.from(value).div('1000000000000'), 6)
}

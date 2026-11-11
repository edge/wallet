import { describe, expect, it } from 'vitest'
import { encodeClaimTransfer, parseClaimAmount, validateClaim, validateEthereumInfo } from './ethereum-claim'

const info = {
  rehearsal: true,
  chainId: '0x7a69',
  tokenAddress: '0x4ec1b60b96193a64acae44778e51f7bff2007831',
  claimsAddress: '0x000000000000000000000000000000000000dead',
  confirmations: 2, minAmount: '1000000000000000000',
  tokenCodeHash: '0x5b912c55e41475c2a0d9c46ad3c923f2ce4b2dca84697721de0ba63738c56b3b'
}
const request = {
  ethereumAddress: '0x3333333333333333333333333333333333333333',
  xeAddress: 'aa'.repeat(32),
  amount: '1000000000000000000'
}
const claim = { ...info, ...request, ref: '11'.repeat(32) }

describe('Ethereum claim transfer', () => {
  it('encodes one EDGE transfer with the versioned claim reference', () => {
    expect(encodeClaimTransfer(claim)).toBe(
      '0xa9059cbb000000000000000000000000000000000000000000000000000000000000dead' +
      '0000000000000000000000000000000000000000000000000de0b6b3a7640000' +
      '58454331' + '11'.repeat(32)
    )
  })

  it('keeps six-decimal claim amounts exact in Ethereum base units', () => {
    expect(parseClaimAmount('0.000001').toString()).toBe('1000000000000')
    expect(parseClaimAmount('10000.123456').toString()).toBe('10000123456000000000000')
    for (const value of ['0', '-1', '1e3', '1,000', '0.0000001', '1.2345678', '']) {
      expect(() => parseClaimAmount(value)).toThrow()
    }
  })

  it('refuses to encode a transfer to any other recipient', () => {
    expect(() => encodeClaimTransfer({ ...claim, claimsAddress: '0x' + '22'.repeat(20) })).toThrow(/burn address/i)
  })

  it('refuses a malformed reference before creating a transfer', () => {
    expect(() => encodeClaimTransfer({ ...claim, ref: '11' })).toThrow(/reference/i)
  })
})

describe('Ethereum claim configuration and binding', () => {
  it('accepts the private destination API contract while retaining the destination locally', () => {
    const response = { ...claim }
    delete response.xeAddress
    expect(() => validateClaim(response, info, request)).not.toThrow()
  })
  it('only accepts the pinned EDGE contract on Ethereum or the explicit local rehearsal', () => {
    expect(() => validateEthereumInfo(info)).not.toThrow()
    expect(() => validateEthereumInfo({ ...info, claimsAddress: '0x' + '22'.repeat(20) })).toThrow(/configuration/i)
    expect(() => validateEthereumInfo({ ...info, chainId: '0x1', rehearsal: false })).not.toThrow()
    expect(() => validateEthereumInfo({ ...info, chainId: '0x89' })).toThrow(/network/i)
    expect(() => validateEthereumInfo({ ...info, tokenAddress: '0x4444444444444444444444444444444444444444' })).toThrow(/configuration/i)
    expect(() => validateEthereumInfo({ ...info, tokenCodeHash: `0x${'ab'.repeat(32)}` })).toThrow(/configuration/i)
    expect(() => validateEthereumInfo({ ...info, minAmount: '0' })).toThrow(/configuration/i)
  })

  it('refuses malformed saved claim fields before displaying or resuming them', () => {
    for (const changed of [{ amount: '-1' }, { xeAddress: 'bad' }, { ethereumAddress: 'bad' }]) {
      const saved = { ...claim, ...changed }
      expect(() => validateClaim(saved, info, saved)).toThrow(/invalid/i)
    }
  })

  it('binds the pending claim to the confirmed destination, source and amount', () => {
    expect(() => validateClaim(claim, info, request)).not.toThrow()
    for (const changed of [
      { xeAddress: 'bb'.repeat(32) },
      { ethereumAddress: '0x5555555555555555555555555555555555555555' },
      { amount: '2000000000000000000' },
      { claimsAddress: '0x6666666666666666666666666666666666666666' },
      { chainId: '0x1' },
      { tokenAddress: '0x7777777777777777777777777777777777777777' }
    ]) expect(() => validateClaim({ ...claim, ...changed }, info, request)).toThrow(/match/i)
  })

  it('keeps the original reference when polling or resuming a pending claim', () => {
    expect(() => validateClaim(claim, info, claim)).not.toThrow()
    expect(() => validateClaim({ ...claim, ref: '22'.repeat(32) }, info, claim)).toThrow(/reference/i)
  })
})

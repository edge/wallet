import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import XeAddressModal from './XeAddressModal.vue'
import { xeAccountFromPhrase } from '../../utils/xe-account'

let app
let host

afterEach(() => {
  app?.unmount()
  host?.remove()
})

async function mount() {
  host = document.createElement('div')
  document.body.append(host)
  const props = reactive({ visible: false })
  const created = vi.fn()
  app = createApp({ render: () => h(XeAddressModal, { ...props, close: () => { props.visible = false }, onCreated: created }) })
  app.mount(host)
  props.visible = true
  await nextTick()
  return { props, created }
}

const button = text => [...host.querySelectorAll('button')].find(el => el.textContent.includes(text))
const words = () => [...host.querySelectorAll('.xe-words li')].map(el => el.lastChild.textContent)

async function fill(input, value) {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}

describe('XE address modal v2', () => {
  it('requires three correct words before emitting the derived address', async () => {
    const { created } = await mount()
    const phraseWords = words()
    expect(phraseWords).toHaveLength(24)
    const expected = xeAccountFromPhrase(phraseWords.join(' ')).address
    expect(host.textContent).toContain(expected)
    button('I have written them down').click()
    await nextTick()
    expect(button('Use this address').disabled).toBe(true)
    const inputs = [...host.querySelectorAll('input')]
    expect(inputs).toHaveLength(3)
    await fill(inputs[0], 'wrong')
    expect(button('Use this address').disabled).toBe(true)
    for (const input of inputs) {
      const index = Number(input.id.replace('xe-word-', '')) - 1
      await fill(input, phraseWords[index])
    }
    button('Use this address').click()
    expect(created).toHaveBeenCalledExactlyOnceWith(expected)
  })
  it('requires identical passphrase entries and clears both after applying', async () => {
    await mount()
    const phrase = words().join(' ')
    const originalAddress = xeAccountFromPhrase(phrase).address
    const input = host.querySelector('#xe-bip39-passphrase')
    await fill(input, 'TREZOR')
    expect(button('Apply passphrase').disabled).toBe(true)
    const confirm = host.querySelector('#xe-bip39-passphrase-confirm')
    await fill(confirm, 'TREZOR ')
    expect(button('Apply passphrase').disabled).toBe(true)
    expect(button('I have written them down').disabled).toBe(true)
    // A dispatched event bypasses the disabled button, so test the method too.
    button('Apply passphrase').dispatchEvent(new Event('click'))
    await nextTick()
    expect(host.textContent).toContain(originalAddress)
    expect(input.value).toBe('TREZOR')
    await fill(confirm, 'TREZOR')
    expect(button('Apply passphrase').disabled).toBe(false)
    button('Apply passphrase').click()
    await nextTick()
    expect(input.value).toBe('')
    expect(confirm.value).toBe('')
    expect(host.textContent).toContain(xeAccountFromPhrase(phrase, { passphrase: 'TREZOR' }).address)
    expect(button('I have written them down').disabled).toBe(false)
    button('I have written them down').click()
    await nextTick()
    expect(button('Use this address').disabled).toBe(true)
  })
  it('uses a fresh phrase on New address and clears both passphrase inputs on reset', async () => {
    const { props } = await mount()
    const firstPhrase = words().join(' ')
    const input = host.querySelector('#xe-bip39-passphrase')
    const confirm = host.querySelector('#xe-bip39-passphrase-confirm')
    await fill(input, 'TREZOR')
    await fill(confirm, 'TREZOR')
    expect(button('I have written them down').disabled).toBe(true)
    button('Apply passphrase').click()
    await nextTick()
    expect(input.value).toBe('')
    expect(confirm.value).toBe('')
    expect(host.textContent).toContain(xeAccountFromPhrase(firstPhrase, { passphrase: 'TREZOR' }).address)
    await fill(confirm, 'unfinished')
    expect(button('I have written them down').disabled).toBe(true)
    button('New address').click()
    await nextTick()
    expect(input.value).toBe('')
    expect(confirm.value).toBe('')
    const nextPhrase = words().join(' ')
    expect(nextPhrase).not.toBe(firstPhrase)
    expect(host.textContent).toContain(xeAccountFromPhrase(nextPhrase).address)
    props.visible = false
    await nextTick()
    expect(host.querySelectorAll('.xe-words li')).toHaveLength(0)
  })
})

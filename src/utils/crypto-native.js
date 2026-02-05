// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/**
 * PBKDF2 iteration count for v2 storage format.
 * Per OWASP 2023 recommendations, 600,000+ iterations are recommended for PBKDF2-SHA256.
 * We use 900,000 for additional security margin.
 *
 * Note: Key derivation with this iteration count takes 100-300ms.
 * This is expected behavior, not a bug.
 */
export const ITERATIONS_V2 = 900000

/**
 * Convert a Uint8Array (or ArrayBuffer) to a hexadecimal string.
 *
 * @param {Uint8Array|ArrayBuffer} buffer - The binary data to convert
 * @returns {string} Hexadecimal string representation
 */
export function arrayToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Convert a hexadecimal string to a Uint8Array.
 *
 * @param {string} hex - The hexadecimal string to convert
 * @returns {Uint8Array} Binary data
 */
export function hexToArray(hex) {
  const bytes = hex.match(/.{1,2}/g) || []
  return new Uint8Array(bytes.map(byte => parseInt(byte, 16)))
}

/**
 * Derive an AES-GCM encryption key from a password using PBKDF2-SHA256.
 *
 * Uses the Web Crypto API for native, performant key derivation.
 * The derived key can be used for both encryption and decryption.
 *
 * Note: With 900,000 iterations, this operation takes 100-300ms.
 * This is expected behavior for secure key derivation.
 *
 * @param {string} password - The password to derive the key from
 * @param {Uint8Array} salt - 16-byte salt for key derivation
 * @param {number} [iterations=ITERATIONS_V2] - Number of PBKDF2 iterations
 * @returns {Promise<CryptoKey>} AES-GCM 256-bit key for encryption/decryption
 */
export async function deriveKey(password, salt, iterations = ITERATIONS_V2) {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Import password as raw key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // Derive AES-GCM key using PBKDF2-SHA256
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt JSON-serializable data using AES-GCM with a password-derived key.
 *
 * Generates random salt and IV for each encryption operation.
 * The salt is used for PBKDF2 key derivation, the IV for AES-GCM encryption.
 *
 * @param {*} data - JSON-serializable data to encrypt
 * @param {string} password - Password for encryption
 * @returns {Promise<{salt: string, iv: string, ciphertext: string}>} Encrypted data with salt, IV, and ciphertext as hex strings
 */
export async function encrypt(data, password) {
  // Generate random salt (16 bytes) and IV (12 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Derive encryption key from password
  const key = await deriveKey(password, salt)

  // Encrypt the JSON-stringified data
  const encoder = new TextEncoder()
  const plaintext = encoder.encode(JSON.stringify(data))

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  )

  // Return all components as hex strings
  return {
    salt: arrayToHex(salt),
    iv: arrayToHex(iv),
    ciphertext: arrayToHex(new Uint8Array(ciphertext))
  }
}

/**
 * Decrypt data that was encrypted with the encrypt() function.
 *
 * Uses the provided salt and IV to derive the same key and decrypt.
 * AES-GCM provides authenticated encryption, so tampered data will fail to decrypt.
 *
 * @param {{salt: string, iv: string, ciphertext: string}} encrypted - Encrypted data object with hex-encoded values
 * @param {string} password - Password used for encryption
 * @returns {Promise<*>} Original decrypted data
 * @throws {Error} If decryption fails (wrong password or tampered data)
 */
export async function decrypt(encrypted, password) {
  // Convert hex strings back to binary
  const salt = hexToArray(encrypted.salt)
  const iv = hexToArray(encrypted.iv)
  const ciphertext = hexToArray(encrypted.ciphertext)

  // Derive the same key from password and salt
  const key = await deriveKey(password, salt)

  // Decrypt the ciphertext
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  // Parse and return the JSON data
  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decrypted))
}

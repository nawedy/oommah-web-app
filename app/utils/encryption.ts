export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  )

  const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
  const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

  return {
    publicKey: btoa(String.fromCharCode.apply(null, new Uint8Array(publicKey))),
    privateKey: btoa(String.fromCharCode.apply(null, new Uint8Array(privateKey))),
  }
}

export async function encryptMessage(message: string, publicKey: string) {
  const importedPublicKey = await window.crypto.subtle.importKey(
    'spki',
    Uint8Array.from(atob(publicKey), c => c.charCodeAt(0)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  )

  const encodedMessage = new TextEncoder().encode(message)
  const encryptedMessage = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    importedPublicKey,
    encodedMessage
  )

  return btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedMessage)))
}

export async function decryptMessage(encryptedMessage: string, privateKey: string) {
  const importedPrivateKey = await window.crypto.subtle.importKey(
    'pkcs8',
    Uint8Array.from(atob(privateKey), c => c.charCodeAt(0)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  )

  const decryptedMessage = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    importedPrivateKey,
    Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0))
  )

  return new TextDecoder().decode(decryptedMessage)
}


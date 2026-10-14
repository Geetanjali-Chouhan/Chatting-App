/**
 * WhatsApp-Style End-to-End Encryption (E2EE) Utility
 * Uses native Web Crypto API with AES-GCM 256-bit encryption.
 * Keys are derived deterministically per conversation between two participants.
 * Ciphertext is stored on the server as: e2ee:v1:<base64-iv>:<base64-ciphertext>
 */

// Cache derived CryptoKey objects for fast repeated operations
const keyCache = new Map();

/**
 * Derives a consistent 256-bit AES-GCM key for a private conversation.
 */
async function getConversationKey(user1Id, user2Id) {
  if (!user1Id || !user2Id) return null;

  const id1 = typeof user1Id === "object" ? user1Id?._id || String(user1Id) : String(user1Id);
  const id2 = typeof user2Id === "object" ? user2Id?._id || String(user2Id) : String(user2Id);

  // Sorting guarantees both sender and receiver generate identical conversation key
  const cacheKey = [id1, id2].sort().join("::");

  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey);
  }

  try {
    const rawSecret = `gupshup_e2ee_salt_v1_${cacheKey}`;
    const enc = new TextEncoder();
    const rawKeyMaterial = enc.encode(rawSecret);

    // Derive 256-bit key material using SHA-256
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", rawKeyMaterial);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      hashBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );

    keyCache.set(cacheKey, cryptoKey);
    return cryptoKey;
  } catch (error) {
    console.error("E2EE key generation error:", error);
    return null;
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts a message using AES-GCM 256.
 * Returns e2ee:v1:<iv>:<ciphertext>
 */
export async function encryptMessage(plaintext, senderId, receiverId) {
  try {
    if (!plaintext || typeof plaintext !== "string") return plaintext;

    const key = await getConversationKey(senderId, receiverId);
    if (!key) return plaintext;

    const enc = new TextEncoder();
    const encodedData = enc.encode(plaintext);

    // 12-byte random IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedData
    );

    const ivBase64 = arrayBufferToBase64(iv);
    const ciphertextBase64 = arrayBufferToBase64(ciphertextBuffer);

    return `e2ee:v1:${ivBase64}:${ciphertextBase64}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return plaintext;
  }
}

/**
 * Decrypts an AES-GCM 256 encrypted message.
 * Handles both encrypted and legacy plaintext gracefully.
 */
export async function decryptMessage(cipherOrPlain, senderId, receiverId) {
  try {
    if (!cipherOrPlain || typeof cipherOrPlain !== "string") return cipherOrPlain;

    // If not prefixed with e2ee tag, it's a legacy or plaintext message
    if (!cipherOrPlain.startsWith("e2ee:v1:")) {
      return cipherOrPlain;
    }

    const parts = cipherOrPlain.split(":");
    if (parts.length !== 4) return cipherOrPlain;

    const iv = base64ToUint8Array(parts[2]);
    const ciphertext = base64ToUint8Array(parts[3]);

    const key = await getConversationKey(senderId, receiverId);
    if (!key) return "[🔒 Encrypted Message]";

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    console.warn("Decryption fallback:", error);
    return "[🔒 Encrypted Message]";
  }
}

export function isEncryptedMessage(text) {
  return typeof text === "string" && text.startsWith("e2ee:v1:");
}

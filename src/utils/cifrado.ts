import * as Crypto from 'expo-crypto';

// Cifrado Simétrico con HMAC (usa una clave secreta para cifrar el texto)
export const cifrarSimetrico = async (texto: string, clave: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    texto + clave
  );
};

// Descifrado simulado para HMAC
export const descifrarSimetrico = async (textoCifrado: string, clave: string): Promise<boolean> => {
  // Nota: HMAC no es reversible como AES, es mejor para verificación de integridad, no para descifrado.
  return textoCifrado === await cifrarSimetrico(textoCifrado, clave);
};

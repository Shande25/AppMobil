// global.d.ts o declarations.d.ts
declare module 'react-native-rsa-native' {
    export function generateKeys(keySize: number): Promise<{ public: string; private: string }>;
    export function encrypt(text: string, publicKey: string): Promise<string>;
    export function decrypt(encryptedText: string, privateKey: string): Promise<string>;
  }
  
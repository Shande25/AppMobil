// src/utils/cifradoBackend.ts

// URL del backend (asegúrate de usar la dirección IP correcta en lugar de "localhost")
const BASE_URL = 'http://192.168.3.108:3000'; // Reemplaza con tu dirección IP si estás en una red local

export const generarClavesAsimetricas = async () => {
  try {
    const response = await fetch(`${BASE_URL}/generar-claves`);
    if (!response.ok) throw new Error('Error al generar claves');
    const keys = await response.json();
    return keys; // { publicKey, privateKey }
  } catch (error) {
    console.error('Error al generar claves asimétricas:', error);
    throw error;
  }
};

export const cifrarAsimetricoEnBackend = async (texto: string, publicKey: string) => {
  try {
    const response = await fetch(`${BASE_URL}/cifrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, publicKey }),
    });
    if (!response.ok) throw new Error('Error al cifrar texto');
    const { encrypted } = await response.json();
    return encrypted;
  } catch (error) {
    console.error('Error al cifrar asimétricamente:', error);
    throw error;
  }
};

export const descifrarAsimetricoEnBackend = async (textoCifrado: string, privateKey: string) => {
  try {
    const response = await fetch(`${BASE_URL}/descifrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textoCifrado, privateKey }),
    });
    if (!response.ok) throw new Error('Error al descifrar texto');
    const { decrypted } = await response.json();
    return decrypted;
  } catch (error) {
    console.error('Error al descifrar asimétricamente:', error);
    throw error;
  }
};

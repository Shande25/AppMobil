import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { cifrarSimetrico, descifrarSimetrico } from './src/utils/cifrado';
import { generarClavesAsimetricas, cifrarAsimetricoEnBackend, descifrarAsimetricoEnBackend } from './src/utils/cifradoBackend';

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'simetrico' | 'asimetrico' | 'texto'>('menu');
  const [file, setFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [downloadUri, setDownloadUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>(''); // Nombre del archivo a guardar
  const [inputText, setInputText] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>(''); // Clave para cifrar y descifrar

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
        setDownloadUri(null);
      }
    } catch (error) {
      console.error("Error al seleccionar el archivo:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el archivo.");
    }
  };

  const encryptAndSaveFile = async (type: 'simetrico' | 'asimetrico') => {
    if (!file || !file.uri) {
      Alert.alert("Error", "Primero selecciona un archivo.");
      return;
    }

    if (!fileName || !encryptionKey) {
      Alert.alert("Error", "Por favor, ingresa un nombre y una clave para el archivo cifrado.");
      return;
    }

    try {
      const content = await FileSystem.readAsStringAsync(file.uri);
      let encryptedContent;

      if (type === 'simetrico') {
        encryptedContent = await cifrarSimetrico(content, encryptionKey);
      } else {
        if (!publicKey) {
          Alert.alert("Error", "Primero genera la clave pública.");
          return;
        }
        encryptedContent = await cifrarAsimetricoEnBackend(content, publicKey);
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, encryptedContent, { encoding: FileSystem.EncodingType.UTF8 });

      setDownloadUri(fileUri);
      Alert.alert("Archivo cifrado y guardado", "El archivo se ha guardado y está listo para ser abierto.");

      openEncryptedFile(fileUri);
    } catch (error) {
      console.error("Error al cifrar el archivo:", error);
      Alert.alert("Error", "Hubo un problema al cifrar el archivo.");
    }
  };

  const decryptAndOpenFile = async (type: 'simetrico' | 'asimetrico') => {
    if (!file || !file.uri) {
      Alert.alert("Error", "Primero selecciona un archivo cifrado.");
      return;
    }

    if (!encryptionKey) {
      Alert.alert("Error", "Por favor, ingresa la clave utilizada para cifrar el archivo.");
      return;
    }

    try {
      const content = await FileSystem.readAsStringAsync(file.uri);
      let decryptedContent;

      if (type === 'simetrico') {
        decryptedContent = await descifrarSimetrico(content, encryptionKey);
      } else {
        if (!privateKey) {
          Alert.alert("Error", "Primero genera las claves y usa la clave privada.");
          return;
        }
        decryptedContent = await descifrarAsimetricoEnBackend(content, privateKey);
      }

      if (!decryptedContent) {
        console.error("Error: Contenido descifrado es null o undefined");
        Alert.alert("Error", "No se pudo descifrar el archivo correctamente. Verifica la clave de descifrado.");
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${fileName}_descifrado.txt`;
      await FileSystem.writeAsStringAsync(fileUri, decryptedContent, { encoding: FileSystem.EncodingType.UTF8 });

      setDownloadUri(fileUri);
      Alert.alert("Archivo descifrado y guardado", "El archivo descifrado se ha guardado y está listo para ser abierto.");

      openEncryptedFile(fileUri);
    } catch (error) {
      console.error("Error al descifrar el archivo:", error);
      Alert.alert("Error", "Hubo un problema al descifrar el archivo.");
    }
  };

  const openEncryptedFile = async (uri: string) => {
    try {
      if (Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("No se puede abrir", "La función de compartir no está disponible en este dispositivo.");
      }
    } catch (error) {
      console.error("Error al intentar abrir el archivo:", error);
      Alert.alert("Error", "Hubo un problema al abrir el archivo.");
    }
  };

  const generateKeys = async () => {
    try {
      const keys = await generarClavesAsimetricas();
      setPublicKey(keys.publicKey);
      setPrivateKey(keys.privateKey);
      Alert.alert("Claves generadas", "Clave pública y privada generadas correctamente.");
    } catch (error) {
      console.error("Error al generar claves:", error);
      Alert.alert("Error", "Hubo un problema al generar las claves.");
    }
  };

  const renderMenu = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccione el tipo de cifrado</Text>
      <Button title="Cifrado Simétrico" onPress={() => setScreen('simetrico')} />
      <Button title="Cifrado Asimétrico" onPress={() => setScreen('asimetrico')} />
    </View>
  );

  const renderSimetrico = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Cifrado Simétrico</Text>
      <Button title="Seleccionar Archivo" onPress={pickFile} />
      {file && <Text>Archivo seleccionado: {file.name}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Nombre del archivo cifrado"
        value={fileName}
        onChangeText={setFileName}
      />
      <TextInput
        style={styles.input}
        placeholder="Clave de cifrado"
        secureTextEntry
        value={encryptionKey}
        onChangeText={setEncryptionKey}
      />
      <Button title="Cifrar y Guardar Archivo" onPress={() => encryptAndSaveFile('simetrico')} />
      <Button title="Descifrar Archivo" onPress={() => decryptAndOpenFile('simetrico')} />
      <Button title="Volver al menú" onPress={() => setScreen('menu')} />
    </View>
  );

  const renderAsimetrico = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Cifrado Asimétrico</Text>
      <Button title="Generar Claves" onPress={generateKeys} />
      <Button title="Seleccionar Archivo" onPress={pickFile} />
      {file && <Text>Archivo seleccionado: {file.name}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Nombre del archivo cifrado"
        value={fileName}
        onChangeText={setFileName}
      />
      <Button title="Cifrar y Guardar Archivo" onPress={() => encryptAndSaveFile('asimetrico')} />
      <Button title="Descifrar Archivo" onPress={() => decryptAndOpenFile('asimetrico')} />
      <Button title="Volver al menú" onPress={() => setScreen('menu')} />
    </View>
  );

  return screen === 'menu' ? renderMenu() : screen === 'simetrico' ? renderSimetrico() : renderAsimetrico();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    width: '80%',
    marginVertical: 10,
    padding: 5,
  },
});

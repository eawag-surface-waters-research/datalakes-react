// encryptor.js
import CryptoJS from 'crypto-js';
import { key } from './config.json';

export const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decrypt = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedStr);
};

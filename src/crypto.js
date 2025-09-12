// encryptor.js
import CryptoJS from 'crypto-js';

export const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.REACT_APP_ENCRYPT_KEY).toString();
};

export const decrypt = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.REACT_APP_ENCRYPT_KEY);
  const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedStr);
};

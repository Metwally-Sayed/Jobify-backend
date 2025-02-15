import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.REFRESH_TOKEN_SECRET; // Store this securely

export const encryptToken = (token: string): string => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY as string).toString();
};

export const decryptToken = (encryptedToken: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY as string);
  return bytes.toString(CryptoJS.enc.Utf8);
};

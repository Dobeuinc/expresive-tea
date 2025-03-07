import * as crypto from 'crypto';
// tslint:disable-next-line:no-duplicate-imports
import { KeyPairSyncResult } from 'crypto';

export interface EncryptedMessage {
  iv: string;
  message: string;
}

export interface TeaGatewayMessage {
  [property: string]: any;
}

export default class TeaGatewayHelper {

  static encrypt(data: TeaGatewayMessage, signature: Buffer): EncryptedMessage {
    const iv: Buffer = crypto.randomBytes(16);
    const packet: string = JSON.stringify(data);
    const cipher: crypto.Cipher = crypto.createCipheriv('aes-256-ctr', signature, iv);
    const encrypted: Buffer = Buffer.concat([cipher.update(packet), cipher.final()]);

    return {iv: iv.toString('hex'), message: encrypted.toString('base64')};
  }

  static decrypt(data: EncryptedMessage, signature: Buffer): TeaGatewayMessage {
    const iv: Buffer = Buffer.from(data.iv, 'hex');
    const message: Buffer = Buffer.from(data.message, 'base64');

    const decipher: crypto.Decipher = crypto.createDecipheriv('aes-256-ctr', signature, iv);
    const decrypted:Buffer = Buffer.concat([decipher.update(message), decipher.final()]);

    return JSON.parse(decrypted.toString());
  }

  static sign(data: string, privateKey: string, passphrase: string): Buffer {
    return crypto.sign('sha256', Buffer.from(data), {
      key: privateKey,
      passphrase
    });
  }

  static verify(data: string, publicKey: string, signature: Buffer) {
    return crypto.verify(
      'sha256',
      Buffer.from(data),
      {
        key: publicKey
      },
      signature
    )
  }

  static generateKeys(passphrase: string): KeyPairSyncResult<any, any> {
    const { generateKeyPairSync } = require('crypto');
    return  generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase
      }
    });
  }
}

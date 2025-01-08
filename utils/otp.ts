import {randomBytes} from 'crypto';
import * as bcrypt from 'bcrypt';

export const generateOtp = (length = 6) => {
  let otp = '';
  while (otp.length < length) {
    const randomByte = randomBytes(1).readUInt8(0);
    if (randomByte < 250) {
      otp += (randomByte % 10).toString();
    }
  }
  return otp;
};

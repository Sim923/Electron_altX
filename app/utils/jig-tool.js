import { randomBytes } from 'crypto';
import vocabulary from './jig-tool-vocabulary'; 

const {
  first: firstNames,
  last: lastNames,
  address1,
  address2,
} = vocabulary;

class JigTool {
  constructor () {
    this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.processedAddresses = new Map();
  }

  generateFirstName () {
    return this._getRandomArrayEl(firstNames);
  }

  generateLastName () {
    return this._getRandomArrayEl(lastNames);
  }

  jigAddress1 (address) {
    const words = address.split(' ');
    const number = words.shift();
    const tail = words.pop().toUpperCase();
    let processedAddress = this.processedAddresses.get(address);
    if (!processedAddress) {
      let value = [tail];
      if (address1[tail]) {
        value = address1[tail].slice(0);
      }
      this.processedAddresses.set(address, value);
      processedAddress = value;
    }
    const suffix = this._getRandomArrayEl(processedAddress).toLowerCase();
    const capitalizedSuffix = `${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
    const forwardCaps = this._generateCapts(3);
    return `${forwardCaps} ${number} ${words.join(' ')} ${capitalizedSuffix}`;
  }

  jigAddress2 (address) {
    const [, number] = address.split(' ');
    const appartment = this._getRandomArrayEl(address2);
    return `${appartment} ${number}`;
  }

  jigEmail (email) {
    if(!email.includes('@')) {
      throw new Error(`Invalid email ${email}`);
    }

    const [ left, right ] = email.split('@');
    const suffix = this._generateCapts(8);
    const dottedLeft = this._makeDotted(left);
    return `${dottedLeft}+${suffix}@${right}`;
  }

  jigPhone (phone) {
    const staticPart = phone.slice(0, 3);
    const generatedPart = Array.from({ length: 7 }, () => {
      return parseInt(randomBytes(1).toString('hex'), 16) % 1e1;
    }).join('');
    return `${staticPart}${generatedPart}`;
  }

  _getRandomArrayEl (arr) {
    const number = parseInt(randomBytes(this.alphabet.length).toString('hex'), 16) % arr.length;
    return arr[number];
  }

  _generateCapts (length) {
    return Array.from({ length }, () => {
      const number = parseInt(randomBytes(this.alphabet.length).toString('hex'), 16) % this.alphabet.length;
      return this.alphabet[number];
    }).join('');
  }

  _makeDotted (string) {
    return string.split('').reduce((result, character) => {
      const shouldAddDot = parseInt(randomBytes(1).toString('hex'), 16) > 128;
      if (shouldAddDot) {
        return `${result}${character}.`;
      }
      return `${result}${character}`;
    }).replace(/\.$/, '');
  }
}

export default new JigTool; 

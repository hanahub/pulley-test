import fetch from 'node-fetch';
import msgpack from 'msgpack-lite';

function asciiArrayToString(asciiArray) {
  return asciiArray.map(code => String.fromCharCode(code)).join('');
}

function decryptSwappedString(encrypted) {
  let decrypted = '';
  for (let i = 0; i < encrypted.length; i += 2) {
      // Swap pairs of characters back
      decrypted += encrypted[i + 1] + encrypted[i];
  }
  return decrypted;
}

function decryptAddedAsciiString(encrypted, n) {
  let decrypted = '';
  for (let i = 0; i < encrypted.length; i += 1) {
      // Convert pairs of characters back to their original ASCII values
      // let num = parseInt(encrypted.substr(i, 2), 16) - 48; // Subtract 48 to reverse 'added 0'
      let num = encrypted[i].charCodeAt(0) - n;
      decrypted += String.fromCharCode(num);
  }
  return decrypted;
}

function extractFirstNumber(str) {
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function hexStringToByteArray(hexString) {
  let result = [];
  for (let i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substr(i, 2), 16));
  }
  return result;
}

function byteArrayToHexString(byteArray) {
  return byteArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function xorEncrypt(byteArray, key) {
  let keyBytes = Array.from(key).map((char) => char.charCodeAt(0));
  let encrypted = byteArray.map(
    (byte, index) => byte ^ keyBytes[index % keyBytes.length]
  );
  return encrypted;
}

function decryptHexString(encryptedHexString, key) {
  // Step 1: Hex Decode
  let byteArray = hexStringToByteArray(encryptedHexString);

  // Step 2: Decrypt with XOR
  let decryptedByteArray = xorEncrypt(byteArray, key);

  // Step 3: Hex Encode
  let decryptedHexString = byteArrayToHexString(decryptedByteArray);
  return decryptedHexString;
}

const base64MessagePack = '3AAgDB0aAw4RFwkBEhMeFRgCDxQFBgQAChkWCxwQHwgNBxs=';
function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

// Decode base64 to byte array
const byteArray = base64ToBytes(base64MessagePack);

// Decode messagepack to get the original positions
const originalPositions = msgpack.decode(byteArray);

// Function to reorder the scrambled string based on the original positions
function reorderString(scrambled, positions) {
  let original = new Array(scrambled.length);
  for (let i = 0; i < positions.length; i++) {
      original[positions[i]] = scrambled[i];
  }
  return original.join('');
}

const apiMain = 'https://ciphersprint.pulley.com/';
const apiEndpoint = 'https://ciphersprint.pulley.com/fortinet09@gmail.com';


async function getAnotherTask4(task) {
  try {
    const encrypted = task.encrypted_path.replace('task_', '');
    const decrypted = reorderString(encrypted, originalPositions);
    const endpoint = `${apiMain}task_${decrypted}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('getAnotherTask4: Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    console.log(data)
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function getAnotherTask3(task) {
  try {
    const endpoint = `${apiMain}task_${decryptHexString(task.encrypted_path.replace('task_', ''), 'secret')}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('getAnotherTask3: Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    await getAnotherTask4(data);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function getAnotherTask2(task, task2 = {}) {
  try {
    const n = extractFirstNumber(task.encryption_method);
    const endpoint = `${apiMain}task_${decryptAddedAsciiString(task.encrypted_path.replace('task_', ''), n)}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('getAnotherTask2: Network response was not ok ' + response.statusText);
      // console.log('getAnotherTask2: Network response was not ok ' + response.statusText);
      // await getAnotherTask(task2);
    }
    const data = await response.json();
    await getAnotherTask3(data)
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function getAnotherTask(task) {
  try {
    const endpoint = `${apiMain}task_${decryptSwappedString(task.encrypted_path.replace('task_', ''))}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('getAnotherTask: Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    await getAnotherTask2(data, task);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function getDetailedTask(str) {
  try {
    const endpoint = `${apiMain}task_${str}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('getDetailedTask: Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    await getAnotherTask(data);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function getTask(task) {
  try {
    const endpoint = `${apiMain}${task.encrypted_path}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error('getTask: Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    const encryptedPath = data.encrypted_path.replace('task_', '');
    const str = asciiArrayToString(JSON.parse(encryptedPath));

    await getDetailedTask(str);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}
// Function to fetch data from the API
async function fetchData() {
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    await getTask(data);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Call the fetchData function
fetchData();

// decryptHexString("3320f8fc71b12dea4f2e87a7d33d342d", "secret")
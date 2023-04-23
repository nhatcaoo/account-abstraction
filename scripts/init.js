// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const Util = require('../test/testutils')
const Create2Factory = require('../src/Create2Factory')
const bcryptjs = require('bcryptjs')
const crypto = require('crypto');
const password = "123@123";
const privateKey = "0x9a9c92b1a01fda896e0be2da17cdd41fccc9817d0aec0f12a08c088865702393";
async function main(password, privateKey) {
  // Entrypoint deployed to: 0x91Bf50D45d66BCebeC525DbD54FBF6257fFe759E
  // Singleton deployed to: 0x999225BE2D438ca90FB550e00D476Fb95C5Ccad8
  // d62d79d4258e97740f595bb0eb3ea0aae2b37e3a40fb68a290922236b5424531
  const wallet = new ethers.Wallet(privateKey);
  const randomSalt = Math.floor(Math.random() * (1000 - 0 + 1)) + 0
  // Get the Ethereum address associated with the private key
  const singleton = await hre.ethers.getContractAt('SimpleAccountFactory', '0x999225BE2D438ca90FB550e00D476Fb95C5Ccad8')

  const tx1 = await singleton.createAccount(wallet.address, randomSalt)
  await tx1.wait()
  let addr = await singleton.getAddress(wallet.address, randomSalt)
  console.log('Abstract account deployed to:', addr)

  const hashedPassword = await hashPassword(password)
  if (!verifyPassword(password, hashedPassword)) throw ('hash password wrong')
  console.log("Hashed password: ", hashedPassword)
  const derivePassword = await deriveKey(password)
  console.log('Encrypted password: ', derivePassword);
  const encryptPk = encryptDataWithKey(password, privateKey)

  const derivePasswordHex = Buffer.from(derivePassword, "hex");
  if (await decryptDataWithKey(derivePasswordHex, encryptPk) != privateKey) throw ('encrypted password wrong')
  console.log('encrypted private key (eskey): ', encryptPk)

}



const verifyPassword = async (password, hash) => {
  try {
    // Compare the provided password with the stored hash
    const isMatch = await bcryptjs.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};
const hashPassword = async (password) => {
  try {
    // Generate a salt
    const salt = await bcryptjs.genSalt(10);
    // Hash the password
    const hash = await bcryptjs.hash(password, salt);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};
// Encrypt data using AES-CBC with a given key
function encryptDataWithKey(passphrase, data) {
  // Generate a random salt
  const salt = "0x";

  // Derive a 32-byte key from the passphrase using PBKDF2
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");
  // Generate a random IV (Initialization Vector)
  const iv = crypto.randomBytes(16);

  // Create a cipher using AES-CBC algorithm
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  // Encrypt the data
  const encryptedBuffer = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);

  // Combine the IV and ciphertext into a single Buffer
  const encryptedData = Buffer.concat([iv, encryptedBuffer]);

  // Convert the encrypted data to hexadecimal string
  const encryptedHexString = encryptedData.toString('hex');

  return encryptedHexString;
}
const deriveKey = async (passphrase) => {
  // Generate a random salt
  const salt = "0x";

  // Derive a 32-byte key from the passphrase using PBKDF2
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, "sha256");

  return key.toString("hex");
};
const decryptDataWithKey = async (key, encryptedData) => {
  // Convert the encrypted data from hexadecimal string to Buffer
  const encryptedBuffer = Buffer.from(encryptedData, "hex");

  // Extract the IV from the encrypted data
  const iv = encryptedBuffer.slice(0, 16);

  // Extract the ciphertext from the encrypted data
  const ciphertext = encryptedBuffer.slice(16);

  // Create a decipher using AES-CBC algorithm
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  // Decrypt the ciphertext
  const decryptedBuffer = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  // Convert the decrypted data to UTF-8 string
  const decryptedData = decryptedBuffer.toString("utf8");

  return decryptedData;
};
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main(password, privateKey)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })



// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const EntryPoint = await hre.ethers.getContractFactory('EntryPoint')
  const entrypoint = await EntryPoint.deploy()
  await entrypoint.deployed()

  console.log('Entrypoint deployed to:', entrypoint.address)
  const Singleton = await hre.ethers.getContractFactory('SimpleAccountFactory')
  const singleton = await Singleton.deploy(entrypoint.address)

  await singleton.deployed()

  console.log('Singleton deployed to:', singleton.address)


  // let initCode = Util.getAccountInitCode("0xd7bE2B81344599931447305e659C087b0075021B", singleton, 0)
  // console.log(initCode);
  const tx1 = await singleton.createAccount('0xd7bE2B81344599931447305e659C087b0075021B', 0)
  await tx1.wait()
  let addr = await singleton.getAddress('0xd7bE2B81344599931447305e659C087b0075021B', 0)
  console.log(addr)
  const tx2 = await singleton.createAccount('0x0A4245E1c9ae1042BB21267eA576597b9EF8de17', 0)
  await tx2.wait()
  addr = await singleton.getAddress('0x0A4245E1c9ae1042BB21267eA576597b9EF8de17', 0)
  console.log(addr)
  const tx3 = await singleton.createAccount('0x77aFB8fCb1624d6073c4b0c3dD73775ca1bBD882', 0)
  await tx3.wait()
  addr = await singleton.getAddress('0x77aFB8fCb1624d6073c4b0c3dD73775ca1bBD882', 0)
  console.log(addr)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

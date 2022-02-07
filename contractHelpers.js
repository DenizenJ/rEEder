require('dotenv').config();
const W3 = require('web3');
const Constants = require('./constants');
const Logger = require('./logger');
const address = Constants.address;
const web3 = new W3(Constants.infuraUrl);
const eeContract = new web3.eth.Contract(Constants.eeAbi, Constants.eeAddress);
const renContract = new web3.eth.Contract(Constants.renAbi, Constants.renAddress);

// Generic web3
const checkGas = async () => {
  return await web3.eth.getGasPrice().then((result) => {
    return web3.utils.fromWei(result, 'gwei')
    });
}

// Contract Read
const isReady = async (elfId) => {
  _elf = await eeContract.methods.elves(elfId).call();
  const now = Date.now()/1000;
  return now > _elf.timestamp;
}

// Contract Write
// sendCampaign -> [ids], campaign, sector, rollWeapons (bool), rollItems(bool), useItem(bool)
const sendToCampaign = async (elfArray) => {
  // to start hardcode not using items/weapons -> will want to conditionally do these
  const tx = eeContract.methods.sendCampaign(elfArray, 1, 5, 0, 0, 0);
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address);
  const gas = await tx.estimateGas({from: address});
  const gasPrice = await web3.eth.getGasPrice();

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  .on('transactionHash', function(hash){
    console.log('.')
    Logger.log(`Hash from sendToCampaign(): ${hash}`)
  })
  .on('receipt', function(receipt){
    console.log('.')
    Logger.log(`Receipt from sendToCampaign(): ${receipt}`)
  })
  .on('confirmation', function(confirmationNumber, receipt){
    console.log('.')
    Logger.log(`Confirmation from sendToCampaign(): ${confirmationNumber}`)
    return receipt;
  })
  .on('error', function(error, receipt) {
    console.log('!ERROR - sendToCampaign() -- ', error)
    Logger.log(`ERROR from sendToCampaign(): ${error}`)
  return receipt
});

  return receipt;
}

// const heal = async (healer, target) => {
//   const tx = eeContract.methods.heal(healer, target);
//   const data = tx.encodeABI();
//   const gas = await tx.estimateGas({from: address});
//   const gasPrice = await web3.eth.getGasPrice();

//   const signedTx = await web3.eth.accounts.signTransaction(
//     {
//       to: eeContract.options.address,
//       data,
//       gas,
//       gasPrice,
//     },
//     process.env.KEY
//   )

//   const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//   .on('transactionHash', function(hash){
//     console.log('.')
//     Logger.log(`Hash from heal(): ${hash}`)
//   })
//   .on('receipt', function(receipt){
//     console.log('.')
//     Logger.log(`Receipt from heal(): ${receipt}`)
//   })
//   .on('confirmation', function(confirmationNumber, receipt){
//     console.log('.')
//     Logger.log(`Confirmation from heal(): ${confirmationNumber}`)
//     return receipt;
//   })
//   .on('error', function(error, receipt) {
//     console.log('!ERROR - heal() -- ', error)
//     Logger.log(`ERROR from heal(): ${error}`)
//   return receipt
// });

//   return receipt;
// }

const healRangers = async (druidIds, rangerIds) => {
  let shortLen = druidIds.length < rangerIds.length ? druidIds.length : rangerIds.length
  let batch = new web3.BatchRequest();
  for (let i = 0; i < shortLen; i++) {
    const tx = eeContract.methods.heal(druidIds[i], rangerIds[i]);
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const gas = await tx.estimateGas({from: address});
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: eeContract.options.address,
        data,
        nonce,
        gas,
        gasPrice,
      },
      process.env.KEY
    )

    console.log(`Batching heal from Druid ${druidIds[i]} to Ranger ${rangerIds[i]}`)
    Logger.log(`Batching heal from Druid ${druidIds[i]} to Ranger ${rangerIds[i]}`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTx.rawTransaction))
  }

  console.log(`Executing batch heal`)
  Logger.log(`Executing batch heal`)
  batch.execute();
}

const batchTest = async () => {
  let batch = new web3.BatchRequest();
  let rangers = [4158,3020,3565,3569,4017,4157,4501,258,288,2581,2591,2731,3557,3559,3561,994];

  for (let i = 0; i < rangers.length; i++) {
    console.log(`adding to batch ${rangers[i]}`)
    batch.add(eeContract.methods.elves(rangers[i]).call.request())
  }
  console.log('executing batch')
  batch.execute();
}

module.exports = {
  checkGas,
  isReady,
  sendToCampaign,
  healRangers,
  batchTest,
}
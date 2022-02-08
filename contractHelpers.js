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
const getElfData = async (elfId) => {
  let elf = {id: elfId}
  _elf = await eeContract.methods.elves(elfId).call();
  _attributes = await eeContract.methods.attributes(elfId).call();
  elf.timestamp = parseInt(_elf.timestamp);
  elf.level = parseInt(_elf.level);
  elf.weaponTier = parseInt(_attributes.weaponTier);
  elf.hasItem = parseInt(_attributes.inventory);
  return elf;
}

// Contract Write
// sendCampaign -> [ids], campaign, sector, rollWeapons (bool), rollItems(bool), useItem(bool)
// campaigns 4,5,6
// sector 5
const sendToCampaign = async (elfArray) => {
  let batch = new web3.BatchRequest();
  
  let lvlSevens = [];
  let lvlFourteens = [];
  let lvlThirties = [];

  elfArray.forEach((elf) => {
    if (elf.level < 7) {
      console.log(`Elf ${elf.id} is only level ${elf.level} - can not run current active campaigns`)
      Logger.log(`Elf ${elf.id} is only level ${elf.level} - can not run current active campaigns`)
    } else if (elf.level < 14) {
      lvlSevens.push(elf.id)
    } else if (elf.level < 30) {
      lvlFourteens.push(elf.id)
    } else if (elf.level > 29) {
      lvlThirties.push(elf.id)
    } else {
      console.log(`Warning -- Elf ${elf.id} is level ${elf.level} and did not push into a campaign group`)
      Logger.log(`Warning -- Elf ${elf.id} is level ${elf.level} and did not push into a campaign group`)
    }
  })

 
  // update campaign & sector info - LVL 7-13
  const txSevens = eeContract.methods.sendCampaign(lvlSevens, 4, 5, 0, 0, 0);
  let data = txSevens.encodeABI();
  let nonce = await web3.eth.getTransactionCount(address);
  let gas = await txSevens.estimateGas({from: address});
  let gasPrice = await web3.eth.getGasPrice();

  const signedTxSevens = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )
 
  // update campaign & sector info - LVL 14-29
  const txFourteens = eeContract.methods.sendCampaign(lvlFourteens, 5, 5, 0, 0, 0);
  data = txFourteens.encodeABI();
  nonce = await web3.eth.getTransactionCount(address);
  gas = await txFourteens.estimateGas({from: address});
  gasPrice = await web3.eth.getGasPrice();

  const signedTxFourteens = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )
 
  // update campaign & sector info - LVL 30+
  const txThirties = eeContract.methods.sendCampaign(lvlThirties, 6, 5, 0, 0, 0);
  data = txThirties.encodeABI();
  nonce = await web3.eth.getTransactionCount(address);
  gas = await txThirties.estimateGas({from: address});
  gasPrice = await web3.eth.getGasPrice();

  const signedTxThirties = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )

  if (lvlSevens.length > 0) {
    console.log(`Adding ${lvlSevens} to batch campaign`)
    Logger.log(`Adding ${lvlSevens} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxSevens.rawTransaction))
  }
  if (lvlFourteens.length > 0) {
    console.log(`Adding ${lvlFourteens} to batch campaign`)
    Logger.log(`Adding ${lvlFourteens} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxFourteens.rawTransaction))
  }
  if (lvlThirties.length > 0) {
    console.log(`Adding ${lvlThirties} to batch campaign`)
    Logger.log(`Adding ${lvlThirties} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxThirties.rawTransaction))
  }
  console.log(`Executing batch campaign`)
  Logger.log(`Executing batch campaign`)
  batch.execute();


}

const healRangers = async (druids, rangers) => {
  let shortLen = druids.length < rangers.length ? druids.length : rangers.length
  if (shortLen < 1) {
    return;
  }

  let batch = new web3.BatchRequest();
  for (let i = 0; i < shortLen; i++) {
    const tx = eeContract.methods.heal(druids[i].id, rangers[i].id);
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

    console.log(`Batching heal from Druid ${druids[i].id} to Ranger ${rangers[i].id}`)
    Logger.log(`Batching heal from Druid ${druids[i].id} to Ranger ${rangers[i].id}`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTx.rawTransaction))
  }

  console.log(`Executing batch heal`)
  Logger.log(`Executing batch heal`)
  batch.execute();
}

// const batchTest = async () => {
//   let batch = new web3.BatchRequest();
//   let rangers = [4158,3020,3565,3569,4017,4157,4501,258,288,2581,2591,2731,3557,3559,3561,994];

//   for (let i = 0; i < rangers.length; i++) {
//     console.log(`adding to batch ${rangers[i]}`)
//     batch.add(eeContract.methods.elves(rangers[i]).call.request())
//   }
//   console.log('executing batch')
//   batch.execute();
// }

module.exports = {
  checkGas,
  getElfData,
  sendToCampaign,
  healRangers,
}
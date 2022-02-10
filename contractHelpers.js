require('dotenv').config();
const W3 = require('web3');
const Logger = require('./logger');
const { lowLevel, midLevel, highLevel } = require('./settings');
const Constants = require('./constants');
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
  let _elf = await eeContract.methods.elves(elfId).call();
  let _attributes = await eeContract.methods.attributes(elfId).call();
  elf.timestamp = parseInt(_elf.timestamp);
  elf.level = parseInt(_elf.level);
  elf.weaponTier = parseInt(_attributes.weaponTier);
  elf.inventory = parseInt(_attributes.inventory);
  return elf;
}

// Contract Write
// sendCampaign -> [ids], campaign, sector, rollWeapons (bool), rollItems(bool), useItem(bool)
// campaigns 4,5,6
// sector 5
const sendToCampaign = async (elfArray) => {
  let batch = new web3.BatchRequest();
  
  let lowLevels = [];
  let midLevels = [];
  let highLevels = [];

  elfArray.forEach((elf) => {
    if (elf.level < lowLevel) {
      console.log(`Elf ${elf.id} is only level ${elf.level} - can not run current active campaigns`)
      Logger.log(`Elf ${elf.id} is only level ${elf.level} - can not run current active campaigns`)
    } else if (elf.level < midLevel) {
      console.log(`Elf ${elf.id} is level ${elf.level} - sending to campaign 4`)
      Logger.log(`Elf ${elf.id} is level ${elf.level} - sending to campaign 4`)
      lowLevels.push(elf.id)
    } else if (elf.level < highLevel) {
      console.log(`Elf ${elf.id} is level ${elf.level} - sending to campaign 5`)
      Logger.log(`Elf ${elf.id} is level ${elf.level} - sending to campaign 5`)
      midLevels.push(elf.id)
    } else if (elf.level >= highLevel) {
      console.log(`Elf ${elf.id} is level ${elf.level} - sending to campaign 6`)
      Logger.log(`Elf ${elf.id} is level ${elf.level} - sending to campaign 6`)
      highLevels.push(elf.id)
    } else {
      console.log(`Warning -- Elf ${elf.id} is level ${elf.level} and did not push into a campaign group`)
      Logger.log(`Warning -- Elf ${elf.id} is level ${elf.level} and did not push into a campaign group`)
    }
  })

  const txLow = eeContract.methods.sendCampaign(lowLevels, 4, 5, 0, 1, 1);
  let data = txLow.encodeABI();
  let nonce = await web3.eth.getTransactionCount(address);
  let gas = await txLow.estimateGas({from: address});
  let gasPrice = await web3.eth.getGasPrice();

  const signedTxLow = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )
 
  const txMid = eeContract.methods.sendCampaign(midLevels, 5, 5, 0, 1, 1);
  data = txMid.encodeABI();
  nonce = await web3.eth.getTransactionCount(address);
  gas = await txMid.estimateGas({from: address});
  gasPrice = await web3.eth.getGasPrice();

  const signedTxMid = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )
 
  const txHigh = eeContract.methods.sendCampaign(highLevels, 6, 5, 0, 1, 1);
  data = txHigh.encodeABI();
  nonce = await web3.eth.getTransactionCount(address);
  gas = await txHigh.estimateGas({from: address});
  gasPrice = await web3.eth.getGasPrice();

  const signedTxHigh = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )

  if (lowLevels.length > 0) {
    console.log(`Adding ${lowLevels} to batch campaign`)
    Logger.log(`Adding ${lowLevels} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxLow.rawTransaction))
  }
  if (midLevels.length > 0) {
    console.log(`Adding ${midLevels} to batch campaign`)
    Logger.log(`Adding ${midLevels} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxMid.rawTransaction))
  }
  if (highLevels.length > 0) {
    console.log(`Adding ${highLevels} to batch campaign`)
    Logger.log(`Adding ${highLevels} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxHigh.rawTransaction))
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

module.exports = {
  checkGas,
  getElfData,
  sendToCampaign,
  healRangers,
}
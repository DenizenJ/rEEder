const Logger = require('./logger');
const Contracts = require('./contractHelpers')
const { druids, assassins, rangers, acceptableGwei } = require('./settings');
const { getElvesData, getReady, shouldHeal, getGas, sendAllOnCampaign } = require('./helpers');

const getReadyAssassins = (sinData) => {
  Logger.log(`getting ready Assassins`)
  console.log('getting ready Assassins');
  let ready = getReady(sinData);
  return ready;
}

const getReadyRangers = (rangerData) => {
  Logger.log(`getting ready Rangers`)
  console.log('getting ready Rangers');
  let ready = getReady(rangerData)
  return ready;
}

const getHealableRangers = (rangerData) => {
  Logger.log(`getting healable Rangers`)
  console.log('getting healable Rangers');
  let healable = shouldHeal(rangerData)
  return healable;
}

const getReadyDruids = (druidData) => {
  Logger.log(`getting ready Druids`)
  console.log('getting ready Druids');
  let ready = getReady(druidData)
  return ready;
}

const execute = async () => {
  await getGas();
  let sinData = await getElvesData(assassins);
  let rangerData = await getElvesData(rangers);
  let druidData = await getElvesData(druids);

  let readyAssassins = getReadyAssassins(sinData);
  let readyRangers = getReadyRangers(rangerData);
  let healableRangers = getHealableRangers(rangerData);
  let readyDruids = getReadyDruids(druidData);
  
  let currentGwei = await Contracts.checkGas();
  if (parseInt(currentGwei) > acceptableGwei) {
    console.log(`Gwei at ${currentGwei} - pausing loop`)
    Logger.log(`Current gwei: ${currentGwei} -- pausing before starting campaign`)
    return
  } 

  // sending even if fully empty
  if (readyAssassins.length > 0 || readyRangers.length > 0) {
    await sendAllOnCampaign(readyAssassins, readyRangers);
  }

  currentGwei = await Contracts.checkGas();
  if (parseInt(currentGwei) > acceptableGwei) {
    console.log(`Gwei at ${currentGwei} - pausing loop`)
    Logger.log(`Current gwei: ${currentGwei} -- pausing before healing rangers`)
    return
  } 

  await Contracts.healRangers(readyDruids, healableRangers);
}

module.exports = {
  execute,
}
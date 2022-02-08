const Logger = require('./logger');
const Contracts = require('./contractHelpers')
const { druids, assassins, rangers, acceptableGwei } = require('./settings');
const { getElvesData, getReady, shouldHeal, getGas, sendAllOnCampaign } = require('./helpers');

const getReadyAssassins = (sinData) => {
  let ready = getReady(sinData);
  Logger.log(`Assassins ready: ${ready}`)
  console.log('Assassins ready to send on a campaign: ', ready);
  return ready;
}

const getReadyRangers = (rangerData) => {
  let ready = getReady(rangerData)
  Logger.log(`Rangers ready: ${ready}`)
  console.log('Rangers ready to send on a campaign: ', ready);
  return ready;
}

const getHealableRangers = (rangerData) => {
  let healable = shouldHeal(rangerData)
  Logger.log(`Rangers to heal: ${healable}`)
  console.log('Rangers to heal: ', healable);
  return healable;
}

const getReadyDruids = (druidData) => {
  let ready = getReady(druidData)
  Logger.log(`Druids ready: ${ready}`)
  console.log('Druids ready to Heal: ', ready);
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
  
  await sendAllOnCampaign(readyAssassins, readyRangers);

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
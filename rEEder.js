const Logger = require('./logger');
const Contracts = require('./contractHelpers')
const { druids, assassins, rangers, acceptableGwei } = require('./settings');
const { getReady, getHealable, getGas, sendAllOnCampaign } = require('./helpers');

const getReadyAssassins = async () => {
  let ready = await getReady(assassins)
  Logger.log(`Assassins ready: ${ready}`)
  console.log('Assassins ready to send on a campaign: ', ready);
  return ready;
}

const getReadyRangers = async () => {
  let ready = await getReady(rangers)
  Logger.log(`Rangers ready: ${ready}`)
  console.log('Rangers ready to send on a campaign: ', ready);
  return ready;
}

const getHealableRangers = async () => {
  let healable = await getHealable(rangers)
  Logger.log(`Rangers to heal: ${healable}`)
  console.log('Rangers to heal: ', healable);
  return healable;
}

const getReadyDruids = async () => {
  let ready = await getReady(druids)
  Logger.log(`Druids ready: ${ready}`)
  console.log('Druids ready to Heal: ', ready);
  return ready;
}

const execute = async () => {
  await getGas();
  let readyAssassins = await getReadyAssassins();
  let readyRangers = await getReadyRangers();
  
  let currentGwei = await Contracts.checkGas();
  if (parseInt(currentGwei) > acceptableGwei) {
    console.log(`Gwei at ${currentGwei} - pausing loop`)
    Logger.log(`Current gwei: ${currentGwei} -- pausing before starting campaign`)
    return
  } 
  
  await sendAllOnCampaign(readyAssassins, readyRangers);
  
  let readyDruids = await getReadyDruids();
  let healableRangers = await getHealableRangers();

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
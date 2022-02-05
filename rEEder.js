const Contracts = require('./contractHelpers');
const { druids, assassins, rangers } = require('./settings');
const { getReady, getGas } = require('./helpers');

const getReadyAssassins = async () => {
  let ready = await getReady(assassins)
  console.log('Assassins ready to send on a campaign: ', ready);
}

const getReadyRangers = async () => {
  let ready = await getReady(rangers)
  console.log('Rangers ready to send on a campaign: ', ready);
}

const getReadyDruids = async () => {
  let ready = await getReady(druids)
  console.log('Druids ready to Heal: ', ready);
}

const execute = async () => {
  await getGas();
  await getReadyAssassins();
  await getReadyRangers();
  await getReadyDruids();
}

module.exports = {
  execute,
}
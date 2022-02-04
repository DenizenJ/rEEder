const Contracts = require('./contractHelpers');
const { druids, assassins, rangers } = require('./settings');

const getReady = async (elfIds) => {
  let promises = [];
  elfIds.forEach((elf) => {
    promises.push(Contracts.isReady(elf));
  })
  
  let readyList = await Promise.all(promises)

  let pairs = []
  const zip = (a, b) => a.map((k, i) => pairs.push([k, b[i]]))
  zip(elfIds, readyList);
  let readyElves = pairs.filter((pair) => pair[1] == true)
  let readyIds = readyElves.map((elf) => elf[0]);
  return readyIds;
}

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

const getGas = async () => {
  let gwei = await Contracts.checkGas()
  console.log('Current gwei: ', gwei);
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
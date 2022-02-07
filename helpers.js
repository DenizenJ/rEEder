const Contracts = require('./contractHelpers');

const getGas = async () => {
  let gwei = await Contracts.checkGas()
  console.log('Current gwei: ', gwei);
}

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

const getHealable = async (elfIds) => {
  let promises = [];
  elfIds.forEach((elf) => {
    promises.push(Contracts.shouldHeal(elf));
  })
  
  let healList = await Promise.all(promises)

  let pairs = []
  const zip = (a, b) => a.map((k, i) => pairs.push([k, b[i]]))
  zip(elfIds, healList);
  let healableElves = pairs.filter((pair) => pair[1] == true)
  let healableIds = healableElves.map((elf) => elf[0]);
  return healableIds;
}

const sendAllOnCampaign = async (readyAssassins, readyRangers) => {
  let readyElves = readyAssassins.concat(readyRangers);
  await Contracts.sendToCampaign(readyElves);
}

module.exports = {
  getGas,
  getReady,
  getHealable,
  sendAllOnCampaign,
}
const Contracts = require('./contractHelpers');
const Logger = require('./logger');

const getGas = async () => {
  let gwei = await Contracts.checkGas()
  console.log('Current gwei: ', gwei);
}

const getElvesData = async (elfIds) => {
  let promises = [];
  elfIds.forEach((elfId) => {
    promises.push(Contracts.getElfData(elfId));
  })
  console.log(await Promise.all(promises))
  return await Promise.all(promises);
}

const getReady = (elves) => {
  const readyElves = [];
  const now = Date.now()/1000;
  elves.forEach((elf) => {
    if (now > elf.timestamp) {
      Logger.log(`Elf ready -- Id: ${elf.id} Timestamp: ${elf.timestamp}`)
      console.log('Elf ready: ', elf);
      readyElves.push(elf)
    }
  })
  let sortedElves = readyElves.sort((a, b) => a.id - b.id)
  return sortedElves;
}

const shouldHeal = (elves) => {
  const elvesToHeal = [];
  const now = Date.now()/1000;
  elves.forEach((elf) => {
    // 3600 seconds = 1 hour
    const cooldownTime = parseFloat((elf.timestamp - now)/3600)
    // heal if cooldownTime > 18 hours
    if (cooldownTime > 18) {
      Logger.log(`Elf healable -- Id: ${elf.id} Timestamp: ${elf.timestamp}`)
      console.log('Elf healable: ', elf);
      elvesToHeal.push(elf);
    }
  })
  let sortedElves = elvesToHeal.sort((a, b) => b.timestamp - a.timestamp )
  return sortedElves;
}

const sendAllOnCampaign = async (readyAssassins, readyRangers) => {
  let readyElves = readyAssassins.concat(readyRangers);
  await Contracts.sendToCampaign(readyElves);
}

module.exports = {
  getGas,
  getElvesData,
  getReady,
  shouldHeal,
  sendAllOnCampaign,
}
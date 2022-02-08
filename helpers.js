const Contracts = require('./contractHelpers');

const getGas = async () => {
  let gwei = await Contracts.checkGas()
  console.log('Current gwei: ', gwei);
}

// const getLevels = async (elves) => {
//   let promises = [];
//   elves.forEach((elf) => {
//     promises.push(Contracts.checkLevel(elf));
//   })
//   await Promise.all(promises)
// }

const getElvesData = async (elfIds) => {
  let promises = [];
  elfIds.forEach((elf) => {
    promises.push(Contracts.getElfData(elf));
  })

  return await Promise.all(promises);
}

const getReady = (elves) => {
  const readyElves = [];
  const now = Date.now()/1000;
  elves.forEach((elf) => {
    if (now > elf.timestamp) {
      readyElves.push(elf)
    }
  })
  return readyElves;
}

const shouldHeal = (elves) => {
  const elvesToHeal = [];
  const now = Date.now()/1000;
  elves.forEach((elf) => {
    // 3600 seconds = 1 hour
    const timePassed = parseFloat((now - elf.timestamp)/3600)
    // heal if timestamp is within 4 hours
    if (timePassed < 4) {
      elvesToHeal.push(elf);
    }
  })
  return elvesToHeal;
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
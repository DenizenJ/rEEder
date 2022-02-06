const fs = require('fs');
const file = './logs.txt';

const getTimestamp = () => {
  let date = new Date().toDateString()
  let time = new Date().toLocaleTimeString()
  return date + ' -- ' + time + ' -- '
}

const log = (content) => {
  const output = `\n ${getTimestamp()} ${content}`
  fs.appendFile(file, output, err => {
    if (err) {
      console.error(err)
      return
    }
    //file written successfully
  })
}

module.exports = {
  log
}
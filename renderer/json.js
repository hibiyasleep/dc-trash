'use strict'

const fs = require('fs')

module.exports = function(result, option) {

  let path = (option && option.path)? option.path + '.json' : './result.json'

  fs.writeFileSync(path, JSON.stringify(result, null, 2))

}

'use strict'

const ejs = require('ejs')
const fs = require('fs')

module.exports = function(result, option) {

  const template = ejs.compile(
    fs.readFileSync(option && option.template || __dirname + '/template.html', 'utf-8')
  )

  let path = (option && option.path)? option.path + '.html' : './result.html'

  fs.writeFileSync(path, template({
    result: result,
    option: option
  }))

}

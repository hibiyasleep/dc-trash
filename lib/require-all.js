'use strict'

const fs = require('fs')

module.exports = function (options, callback) {

  let result = {}

  if(typeof options == 'string') {
    let o = options
    options = {
      dirname: __dirname + '/' + o
    }
  }

  const ext = options.ext || 'js'
  const pattern = new RegExp('\.(' + ext + ')$/')
  const namePattern = new RegExp('^.+\/(.+?)\.(' + ext + ')$')

  let files = fs.readdirSync(options.dirname)

  files.filter(function(v) {
    pattern.exec(v)
  })

  for(let f of files){
    f = options.dirname + '/' + f
    let realname = namePattern.exec(f)

    if(!fs.statSync(f).isDirectory()) {
      result[realname[1]] = require(f)

      if(callback) {
        callback(realname[1], result[realname[1]])
      }
    }
  }

  return result
}

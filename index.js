'use strict'

const progress = require('progress')
const async = require('async')
const fs = require('fs')

const filters = require('./lib/require-all')('../filters')
const Crawler = require('./lib/Crawler')

const gall = 'rhythmgame'

let prog, message = ''
let c = new Crawler(gall, {
  type: 'id',
  until: 7938081
})

c.on('start', function(latestId, total) {
  console.log(`total page: ${total}p`)

  prog = new progress(':title :current/:total [:bar] :percent, :elapseds, eta :etas', {
   complete: '=',
   incomplete: ' ',
   width: 30,
   total: total
  })
  prog.tick(0, {
    title: gall,
    message: message
  })
})

c.on('progress', function(page, id, drops) {
  prog.tick(1, {
    title: gall,
    cid: id
  })
})

c.on('dropped', function(page, drops) {
  message = `[!] ${drops} dropped!`
})

c.on('error', function(e) {
  console.error(e)
})

c.on('complete', function(pages) {
  prog.terminate()
  prog = new progress('collecting :current/:total [:bar] :percent, :elapseds, eta :etas', {
    complete: '=',
    incomplete: ' ',
    width: 30,
    total: Object.keys(pages).length
  })

  for(let id in pages) {
    let article = pages[id]
    for(let f in filters) {
      filters[f].append(article)
    }
    prog.tick()
  }

  let result = {}
  for(let f in filters) {
    result[f] = filters[f].pop()
  }
  fs.writeFileSync('./result.json', JSON.stringify(result, null, 2))

})

c.start()

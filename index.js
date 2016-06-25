'use strict'

const progress = require('progress')
//const filters = require('./lib/require-all')('filters')

const Crawler = require('./lib/Crawler')

let prog
let c = new Crawler('rhythmgame', {
  type: 'page',
  until: 10
})

c.on('start', function(latestId, total) {
  console.log(`total page: ${total}`)

  prog = new progress(':title :current/:total? [:bar] :percent, :elapseds, eta :eta, #:cid', {
   complete: '=',
   incomplete: ' ',
   width: 30,
   total: total
 })
})

c.on('progress', function(page, id) {
  prog.tick(1, {
    cid: id
  })
})

c.on('complete', function(pages) {
  console.log(pages)
})

c.start()

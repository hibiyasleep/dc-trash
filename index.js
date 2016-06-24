'use strict'

//const filters = require('./lib/require-all')('filters')

const Crawler = require('./lib/Crawler')


let c = new Crawler('rhythmgame', {
  type: 'page',
  until: 50,
  progress: true
})

c.crawl(console.log)

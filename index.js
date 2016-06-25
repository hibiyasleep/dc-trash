'use strict'

const progress = require('progress')
//const filters = require('./lib/require-all')('filters')

const Crawler = require('./lib/Crawler')


/*let prog = new progress(this.progress.format, {
  complete: '=',
  incomplete: ' ',
  width: 30,
  total: this.progress.width
})*/

let c = new Crawler('rhythmgame', {
  type: 'page',
  until: 50
})

c.on('start', function(latestId) {
  console.log(`firstpage id: ${latestId}`)
})

c.on('progress', function(page, id) {
  console.log(`${page}p, #${id}`)
})

c.on('complete', function(pages) {
  console.log(pages.length)
})

c.start()

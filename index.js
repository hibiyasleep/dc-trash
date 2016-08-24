'use strict'

const progress = require('progress')
const program = require('commander')
const async = require('async')
const fs = require('fs')

const Crawler = require('./lib/Crawler')

const version = require('./package.json').version

let gall = ''

program
  .version(version)
  .arguments('<gall>')
  .option('-p, --page <number>', 'Fetch until specified page.', parseInt)
  .option('-i, --id <number>', 'Fetch until specified article ID.', parseInt)
  .option('-q, --quiet', 'Don\'t display progressbar, runs quietly.')
  .option('-d, --dump <filename>', 'write ALL of articles to json file.')
  .option('-r, --renderer <modules>', 'Use all of listed renderer. default: json, html.')
  .option('-f, --write-to <file>', 'Filename without extension, where renderer will write to.')
  .option('-c, --config <file>', 'Specify another configfile.')
  .action((g) => gall = g)
  .parse(process.argv)

let config = require(program.config? __dirname + '/' + program.config : './config.json')

// load filter
let f = require('./lib/require-all')('../filters')
let filters = {}
for(let m in f) {
  if(config.filters[m]) {
    filters[m] = new f[m](config.filters[m])
  }
}

let prog, message = ''

let c = new Crawler(gall, {
  type: program.page? 'page' : program.id? 'id' : undefined,
  until: program.page || program.id
})

c.on('start', function(latestId, total) {
  if(!program.quiet) {
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
  }
})

c.on('progress', function(page, id, drops) {
  if(!program.quiet) {
    prog.tick(1, {
      title: gall,
      cid: id
    })
  }
})

c.on('dropped', function(page, drops) {
  if(!program.quiet) {
    message = `[!] ${drops} dropped!`
  }
})

c.on('error', function(e) {
  console.error(e)
})

c.on('complete', function(pages) {
  if(!program.quiet) {
    prog.terminate()
    prog = new progress('collecting :current/:total [:bar] :percent, :elapseds, eta :etas', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: Object.keys(pages).length
    })
  }

  for(let id in pages) {
    let article = pages[id]
    for(let f in filters) {
      filters[f].append(article)
    }
    if(!program.quiet) { prog.tick() }
  }

  let result = {
    _dump: pages,
    _gall: gall
  }
  for(let f in filters) {
    result[f] = filters[f].pop()
  }

  // render

  let renderlist = program.renderer.split(',')
  let writeTo = program.writeTo || gall

  for(let name of renderlist) {
    let m
    try {
      m = require('./renderer/' + name)
    } catch(e) {
      console.error('[!] An error occured during loading renderer \'' + m + '\': ' + e.message)
    } finally {
      m(result, config.renderer && config.renderer[m] || {
        path: writeTo
      })
    }
  }

  if(program.dump) {
    fs.writeFileSync(program.dump || './pages.json', JSON.stringify(pages, null, 2))
  }

})

c.start()

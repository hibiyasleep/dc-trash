'use strict'

const async = require('async')

const EventEmitter = require('events')

const Trigger = require('./Trigger')
const Fetcher = require('./Fetcher')

const range = function range(high) {
  let low = 1 // Only starts from 1!
  let result = []

  for(let i=low; i<=high; i++)
    result.push(i)

  return result
}

module.exports = class Crawler extends EventEmitter {

  /*
   * Constructor.
   *
   * @param gall {String} gall ID
   * @param option {Object} Condition to stop collecting: object.
   *    type {Sting} id or page. default to page.
   *    until {Number}
   */

  constructor(gall, option) {
    super()

    this.gall = gall
    this.type = option.type || 'page'
    this.until = option.until
    this.articles = {}

    this.fetch = new Fetcher(gall)

  }

  start() {

    this.fetch.first((e, d) => {
      if(e) {
        this.error(e)
        return
      }

      this.latestId = d.id
      this.articlePerPage = d.count
      this.emit('start', d.id)

      if(this.type == 'id') {
        this.pageCalculated = ~~((d.id - this.until) / d.count)
      } else {
        this.pageCalculated = this.until
      }

      let lpage = range(this.pageCalculated)

      async.map(lpage, this.work.bind(this), (e, pages) => {
        this.emit('complete', pages)
      })
    })

  }

  work(page, callback) {

    if(!this.pageDone || this.pageDone > page) {

      this.fetch.page(page, (e, pages, lastId) => {
        if(e) {
          callback(e)
        }

        let article, id, result = {}
        const checkId = this.type === 'id' && (this.until < lastId + 30)

        for(id in pages) {
          article = pages[id]

          if(checkId && id < lastId) {
            this.pageDone = page
            continue
          }

          // append
          result[id] = article
        }
        this.emit('progress', page, id)
        callback(null, page)

      })
    }
  }


}

'use strict'

const async = require('async')

const EventEmitter = require('events')

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

      if(this.type == 'id') {
        this.pageCalculated = ~~((d.id - this.until) / d.count)
      } else {
        this.pageCalculated = this.until
      }

      this.emit('start', this.latestId, this.pageCalculated)

      let lpage = range(this.pageCalculated)
      async.mapLimit(lpage, 16, this.work.bind(this), (e, pages) => {
        if(e) this.emit('error', e)
        else  this.emit('complete', this.articles)
      })
    })

  }

  work(page, callback) {

    if(!this.pageDone || this.pageDone > page) {

      this.fetch.page(page, (e, pages, lastId, dropped) => {
        if(e) {
          this.emit('error', e)
          callback(null)
          return
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
          this.articles[id] = article
        }

        if(dropped.length) {
          this.emit('dropped', page, dropped)
        }
        this.emit('progress', page, id)
        callback(null, page)

      })
    } else {
      callback(null, {})
    }
  }


}

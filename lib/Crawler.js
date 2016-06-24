'use strict'

const progress = require('progress')
const async = require('async')

const events = require('events')

const Trigger = require('./Trigger')
const Fetcher = require('./Fetcher')

module.exports = class Crawler {

  /*
   * Constructor.
   *
   * @param gall {String} gall ID
   * @param option {Object} Condition to stop collecting: object.
   *    type {Sting} id, date, page. default to page.
   *    until {Number|Date}
   *    progress {String, Boolean} progress bar format, or `true` to auto,
   *                              `false` to disable. Optional.
   */

  constructor(gall, option) {

    this.gall = {id: gall}
    this.type = option.type
    this.until = option.until
    this.articles = {}
    this.progress = {}
    this.progressOption = option.progress
    this.trigger = new Trigger(1, this.type == 'page'? this.until : false)

    this.fetch = new Fetcher(gall)

  }

  initProrgess(callback) {

    if(this.progressOption) {

      this.fetch.first((e, d) => {
        if(e) {
          return this.error(e)
        }
        this.gall.firstId = d.id
        this.gall.firstDate = d.date
        this.gall.articlePerPage = d.count

        if(this.type == 'id') {
          this.progress = {
            width:  ~~((d.id - this.until) / d.count) + 2, // 2 pages of padding
            format: ':title :current/:total? [:bar] :percent, :elapseds, eta :eta, #:cid -> #:tid'
          }
        } else if(this.type == 'date') {
          this.progress = {
            from:   d.date,
            width:  (d.id - this.until), // use time as width
            format: ':title :cdate -> :tdate [:bar] :percent, :elapseds, eta :eta'
          }
        } else {
          this.progress = {
            from:   1,
            width:  this.until,
            format: ':title :current/:totalp [:bar] :percent, :elapseds, eta :eta'
          }
        }

        this.progress.to = this.until

        if(typeof this.progressOption === 'string') {
          this.progress.format = option.progress
        }

        this.progress.bar = new progress(this.progress.format, {
          complete: '=',
          incomplete: ' ',
          width: 30,
          total: this.progress.width
        })

        callback()

      })

    } else {
      this.progress = false
      callback()
    }

  }

  updateProgress(article) {

    let value

    if(this.type == 'date') {
      value = this.progress.from - article.date
    } else {
      value = 1
    }

    this.progress.bar.tick(value, {
      cid: article.id,
      cdate: this.formatDate(article.date),
      tid: this.until,
      tdate: this.formatDate(this.until) || '',
      title: this.gall.id + ':'
    })

  }

  addPage(page, last, callback) {

    let article, first

    for(let id in page) {
      article = page[id]
      first = first || article
      this.articles[id] = article

      if(this.type == 'id' && this.until > id
      || this.type == 'date' && this.until > article.date) {
        callback(article)
        return true
      }
    }

    this.updateProgress(first)
    return false
  }

  formatDate(date) {
    return date // TODO
  }

  work(callback) {

    let currentPage = this.trigger.value
    console.log(`page ${currentPage}`)
    this.fetch.page(currentPage, (e, pages, last) => {
      if(e) {
        callback(e)
        return
      }
      this.addPage(pages, last, (lastArticle) => {
        this.trigger.flip()
        callback(lastArticle)
      }) || callback(null)
    })

  }

  crawl(callback) {

    this.initProrgess(() => {

      async.until(this.trigger.tester(), (cb) => {

        async.parallel([
          (callback) => this.work(callback),
          (callback) => this.work(callback),
          (callback) => this.work(callback),
          (callback) => this.work(callback)
        ], cb)

      }, (e, lastArticle) => {
        if(e) {
          return this.error(e)
        }
        callback(Object.keys(this.articles).length)
      })
    })

  }

  error(e) {
    console.error(e)
    process.exit(1)
  }

}

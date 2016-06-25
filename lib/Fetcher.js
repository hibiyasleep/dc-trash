'use strict'

const request = require('request')
const cheerio = require('cheerio')

const GALL_ENDPOINT = 'http://gall.dcinside.com/board/lists?' // id, page
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17'

module.exports = class Fetcher {
  constructor(gall) {
    this.gall = gall
    this.url = GALL_ENDPOINT + 'id=' + gall + '&page='
  }

  page(page, callback) {

    if(!page) {
      return
    }

    request({
      url: this.url + page,
      headers: {
        'User-Agent': UA
      }
    }, function(e, responce, d) {
      if(e) {
        callback(e)
        return
      }
      let $ = cheerio.load(d)
      let lastId, lastDate

      let r = {}
      $('.list_thead > .tb').each(function(i, o) {
        let $o = $(o)
        let articleClass, id

        if($o.find('.icon_notice').length) {
          return
        }

        articleClass = $o.find('.t_subject > a').attr('class')
        lastId = parseInt($o.find('.t_notice').text())
        lastDate = new Date($o.find('.t_date').attr('title').replace(/\./g, '/'))

        r[lastId] = {
          // Article info
          id:         lastId,
          title:      $o.find('.t_subject > a').first().text(),
          hasPicture: articleClass.indexOf('_pic_') != -1,
          best:       articleClass.indexOf('_b') != -1,
          // Author info
          nickname:   $o.find('.t_writer').attr('user_name'),
          authorId:   $o.find('.t_writer').attr('user_id') || null,
          // Additional article info
          reply:      parseInt($o.find('.t_subject em').text().substring(1)) || 0,
          date:       lastDate,
          hit:        parseInt($o.find('.t_date + .t_hits').text()),
          recommend:  parseInt($o.find('.t_hits + .t_hits').text())
        }

      })

      callback(null, r, lastId)
    })
  }

  first(callback) {
    request({
      url: this.url + 1,
      headers: {
        'User-Agent': UA
      }
    }, function(e, responce, d) {
      if(e) {
        callback(e)
        return
      }

      let $ = cheerio.load(d)
      let o = $('.list_thead > .tb:not(:has(>td>.icon_notice))')
      let $o = o.first()

      callback(null, {
        id: parseInt($o.find('.t_notice').text()),
        count: o.length
      })

    })
  }
}

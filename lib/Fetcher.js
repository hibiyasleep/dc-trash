'use strict'

const request = require('request')
const cheerio = require('cheerio')

const GALL_ENDPOINT = 'http://gall.dcinside.com/board/lists?' // id, page
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/11.0 Safari/601.6.17',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

module.exports = class Fetcher {
  constructor(gall) {
    this.gall = gall
    this.url = GALL_ENDPOINT + 'id=' + gall + '&page='
  }

  page(page, callback) {

    if(!page) {
      callback(new Error('No page given'))
    }

    request({
      url: this.url + page,
      headers: HEADERS
    }, function(e, responce, d) {
      if(e) {
        callback(e)
        return
      }
      let $ = cheerio.load(d)

      let id
      let r = {}
      let dropped = []

      $('.list_tbody > .tb').each(function(i, o) {
        let $o = $(o)
        let articleClass

        if($o.find('.icon_notice').length) {
          return
        }

        try {
          id = parseInt($o.find('.t_notice').text())
          articleClass = $o.find('.t_subject > a').attr('class')

          r[id] = {
            // Article info
            id:         id,
            title:      $o.find('.t_subject > a').first().text(),
            hasPicture: articleClass.indexOf('_pic_') != -1,
            best:       articleClass.indexOf('_b') != -1,
            // Author info
            nickname:   $o.find('.t_writer').attr('user_name'),
            authorId:   $o.find('.t_writer').attr('user_id') || null,
            // Additional article info
            reply:      parseInt($o.find('.t_subject em').text().substring(1)) || 0,
            date:       new Date($o.find('.t_date').attr('title').replace(/\./g, '/')),
            view:       parseInt($o.find('.t_date + .t_hits').text()),
            recommend:  parseInt($o.find('.t_hits + .t_hits').text())
          }
        } catch(e) {
          dropped.push(id)
          return
        }

      })

      callback(null, r, id, dropped)
    })
  }

  first(callback) {
    request({
      url: this.url + 1,
      headers: HEADERS
    }, function(e, responce, d) {
      console.log(e, responce, d)
      if(e) {
        callback(e)
        return
      }

      let $ = cheerio.load(d)
      let o = $('.list_tbody > .tb:not(:has(>td>.icon_notice)) .t_notice')
      let $o = o.first()

      callback(null, {
        id: parseInt($o.text()),
        count: o.length
      })

    })
  }
}

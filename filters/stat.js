'use strict'

module.exports = function timedStat() {

  this.count = 0
  this.hasPicture = 0
  this.hasId = 0

  this.max = {
    view: {
      id: [],
      value: -1
    },
    reply: {
      id: [],
      value: -1
    },
    recommend: {
      id: [],
      value: -1
    }
  }

  this.total = {
    view: 0,
    reply: 0,
    recommend: 0
  }

  this.time = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]

  this.append = function append(article) {

    this.count++

    this.total.view += article.view
    this.total.reply += article.reply
    this.total.recommend += article.recommend

    if(article.hasPicture) {
      this.hasPicture++
    }
    if(article.authorId) {
      this.hasId++
    }

    if(this.max.view.value < article.view) {
      this.max.view.value = article.view
      this.max.view.id = [article.id]
    } else if(this.max.view.value == article.view) {
      this.max.view.id.push(article.id)
    }
    if(this.max.reply.value < article.reply) {
      this.max.reply.value = article.reply
      this.max.reply.id = [article.id]
    } else if(this.max.reply.value == article.reply) {
      this.max.reply.id.push(article.id)
    }
    if(this.max.recommend.value < article.recommend) {
      this.max.recommend.value = article.recommend
      this.max.recommend.id = [article.id]
    } else if(this.max.recommend.value == article.recommend) {
      this.max.recommend.id.push(article.id)
    }

    this.time[article.date.getHours()]++
  }

  this.pop = function pop() {
    return {
      count:      this.count,
      hasPicture: this.hasPicture,
      hasId:      this.hasId,
      total:      this.total,
      avg: {
        view:       this.total.view / this.count,
        reply:      this.total.reply / this.count,
        recommend:  this.total.recommend / this.count
      },
      max: this.max,
      time: this.time
    }
  }

  return this


}

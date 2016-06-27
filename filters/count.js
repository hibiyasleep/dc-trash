'use strict'

class d_NickCount {

  constructor() {
    this.ids = {}
    this.nicks = {}
  }

  append(article) {

    // fixed nick?
    if(article.authorId) {
      // known to this.ids?
      if(this.ids[article.authorId]) {
        // nickname already exists?
        if(this.ids[article.authorId].indexOf(article.nickname) === -1) {
          this.ids[article.authorId].push(article.nickname)
        }
      // new nickname
      } else {
        this.ids[article.authorId] = [article.nickname]
      }

      // tick count
      this.nicks[article.authorId] = (this.nicks[article.authorId] || 0) + 1

    } else {
      this.nicks[article.nickname] = (this.nicks[article.nickname] || 0) + 1
    }

  }

  pop() {
    let k = Object.keys(this.nicks).sort((a, b) => this.nicks[b] - this.nicks[a])
    let result = []
    let len = k.length < 300? k.length : 300

    for(let i=0; i<len; i++) {
      let id = k[i]
      result[i + 1] = {
        nick: this.ids[id] || [id],
        fixed: !!this.ids[id],
        count: this.nicks[id]
      }
    }

    return result
  }

}

module.exports = new d_NickCount()
module.exports.class = d_NickCount

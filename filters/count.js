'use strict'

module.exports = function nickCount(option) {

  // mapping of id -> nick
  this.ids = {}
  // real count goes here.
  this.nicks = {}

  if(option.pseudoFixed) {
    this.pF = option.pseudoFixed
    this.parsePseudoFixed = function parsePseudoFixed(nick) {
      for(let id in this.pF) {
        if(this.pF.hasOwnProperty(id)) {
          let re = new RegExp(this.pF[id], 'i')
          if(re.test(nick)) {
            return id
          }
        }
      }
    }
  } else {
    this.parsePseudoFixed = function pseudoFixedDisabled() { return false }
  }

  this.append = function append(article) {

    let p = this.parsePseudoFixed(article.nickname)
    let id = p || article.authorId

    // (pseudo-) fixed?
    if(id) {
      // known to this.ids?
      if(this.ids[id]) {
        // but this nickname doesn't exists?
        if(this.ids[id].indexOf(article.nickname) === -1) {
          // then add to this.ids
          this.ids[id].push(article.nickname)
        }
      } else {
        this.ids[id] = [article.nickname]
      }
      this.nicks[id] = (this.nicks[id] || 0) + 1
    } else {
      this.ids[article.authorId] = [article.nickname]
      this.nicks[article.nickname] = (this.nicks[article.nickname] || 0) + 1
    }

  }

  this.pop = function pop() {
    let k = Object.keys(this.nicks).sort((a, b) => this.nicks[b] - this.nicks[a])
    let result = []
    let len = k.length// < 300? k.length : 300

    for(let i=0; i<len; i++) {
      let id = k[i]
      result[i + 1] = {
        nick: this.ids[id] || [id],
        fixed: this.ids[id]? id : false,
        count: this.nicks[id]
      }
    }

    return result
  }

  return this

}

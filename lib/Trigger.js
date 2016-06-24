'use strict'

module.exports = class Trigger {
  constructor(value, limit) {
    this.flag = true
    this.v = value || 0
    this.limit = limit || 0
  }

  test(v) {
    console.log(this)
    return (this.limit? ((v || this.v) > this.limit) : this.flag)
  }

  tester() {
    let self = this
    return function() {
      return (self.limit? (self.v > self.limit) : self.flag)
    }
  }

  flip() {
    this.flag = !this.flag
  }

  add(c) {
    this.v += (c || 1)
  }

  get value() {
    this.v += 1
    return this.test()? this.v : false
  }

  set value(v) {
    this.v = v
  }

}

document.addEventListener("DOMContentLoaded", function(event) {
  CreateComponent('hello-component', {
    counter: {
      get () {
        return Number(this.getAttribute('counter') || 0)
      },
      set (n) {
        this.setAttribute('counter', n)
      }
    },
    render () {
      return `
        <p>Hello ${this.counter} from component</p>
        <button data-number="${this.counter}">count!</button>
      `
    },
    count () {
      this.counter += 1
    },
    events: {
      'click button': function () {
        this.count()
      }
    },
    observedAttributes () {
      return ['class', 'counter']
    }
  })
})

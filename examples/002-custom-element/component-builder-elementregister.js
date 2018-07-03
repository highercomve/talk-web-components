(function (document, window) {
  function consoleThis () {
    console.log(...arguments)
  }
  
  function clone (obj, list = [], include = true) {
    return Object.keys(obj).reduce((result, key) => {
      if (list.includes(key) === include) {
        result[key] = obj[key]
      }
      return result
    }, {})
  }
  
  function emptyTemplate () {
    return `<p>empty template for ${this.tagName}</p>`
  }
  
  function mountedBuilder (options) {
    return function onMounted () {
      updateComponent.call(this)
      return options.onMounted ? options.onMounted.call(this) : consoleThis.call(this)
    }
  }

  function updateComponent () {
    if (this.children.length > 0) {
      var templateContainer = document.createElement('div')
      templateContainer.innerHTML = this.render(this)
      this.insertBefore(templateContainer.children[0], this.firstChild)
    } else {
      this.innerHTML = this.render(this)
    }
  }

  function isRequired (message) {
    throw new Error(message)
  }

  window.CreateComponent = function (name = isRequired('name is required'), options = {}) {
    const elemMethods = clone(
      options, 
      ['name', 'onCreated', 'onMounted', 'onUnmounted', 'onChange', 'events', 'observedAttributes'],
      false
    )

    function Component () {
      let _ = Reflect.construct(HTMLElement, [], new.target)
      this.onCreated.call(_)
      return _
    }
    
    Component.prototype = Object.create(HTMLElement.prototype, { 
      constructor: { value: Component, enumerable: false, writable: true, configurable: true }
    })
    Component.prototype.render = options.render || emptyTemplate
    Component.prototype.connectedCallback = mountedBuilder(options)
    Component.prototype.adoptedCallback = options.onAdopted || updateComponent
    Component.prototype.attributeChangedCallback = options.onChange || updateComponent
    Component.prototype.onCreated = options.onCreated || updateComponent
    Component.prototype.disconnectedCallback = options.onUnmounted || consoleThis
    Object.assign(Component.prototype, elemMethods)

    if (options.observedAttributes) {
      Object.defineProperties(Component, {
        observedAttributes: {
          configurable: true,
          get: options.observedAttributes
        }
      })
    }

    customElements.define(name, Component);
  }
})(document, window)
  
(function (window) {
  'use strict';
  const TEXT_NODE = 3
  const ELEMENT_NODE = 1
  const DOCUMENT_FRAGMENT_NODE = 11

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

  function setEvents (events) {
    this.listeners = []
    Object.keys(events || {}).forEach((key) => {
      const type = key.split(/\ (.+)/)[0]
      const selector = key.split(/\ (.+)/)[1]
      const cb = events[key]
      const eventFunction = function (event) {
        if (event.target && event.target.matches(selector)) {
          cb.call(this, ...arguments)
        }
      }
      this.listeners.push({ type, eventFunction })
      this.shadowRoot.addEventListener(type, eventFunction.bind(this))
      this.addEventListener(type, eventFunction.bind(this))
    })
  }

  function unSetEvents () {
    this.listeners.forEach((listener) => {
      this.shadowRoot.removeEventListener(listener.type, listener.eventFunction)
      this.removeEventListener(listener.type, listener.eventFunctio)
    })
  }

  function mountedWrapper (options) {
    return function onMounted () {
      updateComponent.call(this)
      return options.connectedCallback
        ? options.connectedCallback.call(this)
        : consoleThis.call(this)
    }
  }

  function updateComponent () {
    return this.render(this)
  }

  function onChange (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      updateComponent.call(this)
    }
  }

  function disconnectedWrapper (cb) {
    return function disconnectedCallback () {
      if (cb) {
        cb.call(this)
      }
    }
  }

  function isRequired (message) {
    throw new Error(message)
  }

  window.CreateComponent = function (name = isRequired('name is required'), options = {}) {
    const elemMethods = clone(
      options,
      [
        'onCreated',
        'connectedCallback',
        'adoptedCallback',
        'attributeChangedCallback',
        'disconnectedCallback',
        'observedAttributes',
        'events'
      ],
      false
    )

    function Component() {
      let _ = Reflect.construct(HTMLElement, [], new.target)
      if (options.template) _.attachShadow({mode: 'open'})
      if (options.template && options.template.nodeType) {
        _.shadowRoot.appendChild(options.template.content.cloneNode(true))
      } else if (options.template) {
        _.shadowRoot.innerHTML = (options.template).replace(/[\n\r]+/g, '')
      }
      _.hyper = hyperHTML.bind(_)
      _.onCreated.call(_)
      return _
    }

    Component.prototype = Object.create(HTMLElement.prototype, {
      constructor: { value: Component, enumerable: false, writable: true, configurable: true }
    })
    Component.prototype.render = options.render || emptyTemplate
    Component.prototype.connectedCallback = mountedWrapper(options)
    Component.prototype.disconnectedCallback = disconnectedWrapper(options.disconnectedCallback || consoleThis.bind(null, 'disconnectedCallback'))
    Component.prototype.attributeChangedCallback = options.attributeChangedCallback || onChange
    Component.prototype.adoptedCallback = options.adoptedCallback || consoleThis.bind(null, 'adoptedCallback')
    Component.prototype.onCreated = options.onCreated || consoleThis.bind(null, 'onCreated')
    Component.prototype.updateComponent = updateComponent
    Component.prototype.onChange = onChange
    Component.prototype.cbName = name

    Object.keys(elemMethods).forEach((key) => {
      const descriptorKeys = ['configurable', 'enumerable', 'value', 'writable', 'get', 'set']
      const isDescriptor = elemMethods[key] &&
                            typeof elemMethods[key] === 'object' &&
                            Object.keys(elemMethods[key]).some((key) => descriptorKeys.includes(key))
      if (isDescriptor) {
        Object.defineProperty(Component.prototype, key, elemMethods[key])
      } else {
        Component.prototype[key] = elemMethods[key]
      }
    })
    if (options.observedAttributes) {
      Object.defineProperty(Component, 'observedAttributes', {
        configurable: true,
        get: options.observedAttributes
      })
    }

    customElements.define(name, Component);
    return Component;
  }
})(window)

(function (window) {
  'use strict';
  const TEXT_NODE = 3
  const ELEMENT_NODE = 1
  
  function updateAttributes (node1, node2) {
    if (node1.nodeType !== ELEMENT_NODE || node1.nodeType !== ELEMENT_NODE) {
      return
    }
    const node1Attributes = node1.getAttributeNames().sort()
    const node2Attributes = node2.getAttributeNames().sort()
    const newLength = node1Attributes.length
    const oldLength = node2Attributes.length
    for (let i = 0; i < newLength || i < oldLength; i++) {
      const attr1Name = node1Attributes[i]
      const attr2Name = node2Attributes[i]
      if (!attr2Name || attr1Name === attr1Name) {
        node2.setAttribute(attr1Name, node1.getAttribute(attr1Name))
      }
      if (!attr1Name) {
        node2.removeAttribute(attr2Name)
      }
    }
  }

  function changed (node1, node2) {
    return typeof node1 !== typeof node2 ||
      typeof node1 === 'string' && node1 !== node2 ||
      node1.nodeType === TEXT_NODE && node1.textContent !== node2.textContent ||
      node1.nodeType !== node2.nodeType
  }

  function emptyTextNode (node) {
    return node && node.nodeType === TEXT_NODE && node.nodeValue.trim() === ''
  }

  function updateElement ($parent, newNode, oldNode, index = 0) {
    if ((!oldNode && !newNode) || (emptyTextNode(newNode) && emptyTextNode(oldNode))) {
      return
    }
    if (!oldNode) {
      $parent.appendChild(
        newNode
      );
      return
    }
    if (!newNode) {
      $parent.removeChild(
        $parent.childNodes[index]
      );
      return
    }
    if (changed(newNode, oldNode)) {
      $parent.replaceChild(
        newNode,
        $parent.childNodes[index]
      );
      return
    } 
    if (newNode) {
      const newLength = newNode.childNodes.length;
      const oldLength = oldNode.childNodes.length;
      updateAttributes(newNode, oldNode)
      const newChildren = [...newNode.childNodes]
      const oldChildren = [...oldNode.childNodes]
      for (let i = 0; i < newLength || i < oldLength; i++) {
        updateElement(
          $parent.childNodes[index],
          newChildren[i],
          oldChildren[i],
          i
        );
      }
    }
  }

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
      this.addEventListener(type, eventFunction)
    })
  }

  function unSetEvents () {
    this.listeners.forEach((listener) => {
      this.removeEventListener(listener.type, listener.eventFunction)
    })
  }

  function mountedWrapper (options) {
    return function onMounted () {
      updateComponent.call(this)
      setEvents.call(this, options.events)
      return options.connectedCallback
        ? options.connectedCallback.call(this)
        : consoleThis.call(this)
    }
  }

  function updateComponent () {
    const renderTxt = this.render(this)
      .replace(/[\n\r]+/g, '')
    this.template.innerHTML = `<div>${renderTxt}</div>`
    const newContent = this.template.content.cloneNode(true).children[0]
    const lastContent = this.children[0]
    if (this.template.innerHTML !== this.innerHTML) {
      updateElement(this, newContent, lastContent)
    }
  }

  function onChange (name, oldValue, newValue) {
    if (oldValue !== newValue) {
      updateComponent.call(this)
    }
  }

  function disconnectedWrapper (cb) {
    return function disconnectedCallback () {
      unSetEvents.call(this)
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
      _.template = document.createElement('template')
      _.onCreated.call(_)
      _.updateComponent.call(_)
      return _
    }

    Component.prototype = Object.create(HTMLElement.prototype, {
      constructor: { value: Component, enumerable: false, writable: true, configurable: true }
    })
    Component.prototype.render = options.render || emptyTemplate
    Component.prototype.connectedCallback = mountedWrapper(options)
    Component.prototype.disconnectedCallback = disconnectedWrapper(options.disconnectedCallback || consoleThis)
    Component.prototype.attributeChangedCallback = options.attributeChangedCallback || onChange
    Component.prototype.adoptedCallback = options.adoptedCallback || consoleThis
    Component.prototype.onCreated = options.onCreated || consoleThis
    Component.prototype.updateComponent = updateComponent
    Component.prototype.onChange = onChange

    Object.keys(elemMethods).forEach((key) => {
      const descriptorKeys = ['configurable', 'enumerable', 'value', 'writable', 'get', 'set']
      const isDescriptor = Object.keys(elemMethods[key]).some((key) => descriptorKeys.includes(key))
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

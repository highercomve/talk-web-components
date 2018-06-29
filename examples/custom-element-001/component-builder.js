(function (document, window) {
  function consoleThis () {
    console.log(arguments)
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
    return `<span>empty template for ${this.tagName}</span>`
  }
  function mountedBuilder (options, render) {
    return function onMounted () {
      this.innerHTML = render.call(this); 
      return options.onMounted ? options.onMounted.call(this) : consoleThis.call(this)
    }
  }
  window.CreateComponent = function (name = (function () {throw new Error('name is required')}), options = {}) {
    const render = options.render || emptyTemplate
    const onMounted = mountedBuilder(options, render)
    const onCreated = options.onCreated || consoleThis
    const onUnmounted = options.onMounted || consoleThis
    const onChange = options.onMounted || consoleThis
    const elemMethods = clone(options, ['name', 'onCreated', 'onMounted', 'onUnmounted', 'onChange', 'events'], false)
    const lifeCycle = {
      createdCallback: {value: onCreated},
      attachedCallback: {value: onMounted},
      detachedCallback: {value: onUnmounted},
      attributeChangedCallback: {value: onChange}
    }
    const protoOptions = Object.assign(elemMethods, lifeCycle)
    const ComponentProto = Object.create(HTMLElement.prototype, protoOptions)

    document.registerElement(
      name,
      {
        prototype: ComponentProto
      }
    )
  }
})(document, window)
  
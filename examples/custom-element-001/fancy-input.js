(function (document) {
  var TEMPLATE = `
    <div class="fancy-input">
      <label class="fancy-input__label" for="fancy-input__input">This is the label</label>
      <input class="fancy-input__input" id="fancy-input__input" type="text">
    </div>
  `
  function consoleThis () {
    console.log(this)
  }
  const onCreated = consoleThis
  const onMounted = consoleThis
  const onUnmounted = consoleThis
  const onChange = consoleThis

  var ComponentProto = Object.create(HTMLElement.prototype)
  ComponentProto.createdCallback = onCreated
  ComponentProto.attachedCallback = function () {
    if (this.children.length > 0) {
      var templateContainer = document.createElement('div')
      templateContainer.innerHTML = TEMPLATE
      this.insertBefore(templateContainer.children[0], this.firstChild)
    } else {
      this.innerHTML = TEMPLATE
    }
    onMounted.call(this)
  }
  ComponentProto.detachedCallback = onUnmounted
  ComponentProto.attributeChangedCallback = onChange

  document.registerElement('fancy-input', {
    prototype: ComponentProto
  })
})(document)

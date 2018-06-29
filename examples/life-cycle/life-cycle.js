(function (document) {
  var ComponentProto = Object.create(HTMLElement.prototype)
  ComponentProto.createdCallback = function () {
    console.log('life-cycle element created but not attached')
  }
  ComponentProto.attachedCallback = function () {
    console.log('life-cycle element attached')
  }
  ComponentProto.detachedCallback = function () {
    console.log('life-cycle element detached')
  }
  ComponentProto.attributeChangedCallback = function (attrName, oldValue, newValue) {
    console.log('life-cycle element attribute Changed')
    console.log('attrName', attrName)
    console.log('oldValue', oldValue)
    console.log('newValue', newValue)
  }

  document.registerElement('life-cycle', {
    prototype: ComponentProto
  })
})(document)
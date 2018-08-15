(function () {
  document.head.appendChild(
    document.createElement('style')
  ).textContent = `
  .animated-sin-wave {
    position: relative;
    height: 150px;
    width: 100%;
    overflow: hidden;
  }
  
  .animated-sin-wave > .bar {
    position: absolute;
    height: 100%;
    border-radius: 50%;
    max-width:10px;
  }
  
  .animated-sin-wave-description {
    width:100%;
    text-align:center;
    font-size:0.8em;
    color:#747678;
    padding: 2em
  }`;

  const SineWave = {
    active: {
      get() {
        return this.getAttribute('active') === 'true' ? true : false
      },
      set(val) {
        this.setAttribute('active', val)
      }
    },
    count: 0,
    step: 0.5,
    barCount: 0,
    barWidth: 0,
    template: null,
    onCreated() {
      this.step = .5;
      addEventListener('resize', this.onResize.bind(this))
      this.addEventListener('click', this.onClick.bind(this))
    },
    connectedCallback() {
      this.onResize()
      this.start()
    },
    start() {
      if (!this.active) {
        this.active = true
      }
    },
    stop() {
      this.active = false
    },
    onResize() {
      this.barCount = Math.min(200, Math.floor(window.innerWidth / 15));
      this.barWidth = 100 / this.barCount;
    },
    onClick() {
      this.step *= -1
    },
    render() {
      if (this.active) {
        window.requestAnimationFrame(this.updateComponent.bind(this))
      }
      const waves = [];
      this.count += this.step;
      for (let count = this.count, i = 0; i < this.barCount; i++) {
        let translateY = Math.sin(count / 10 + i / 5) * 100 * .5;
        let hue = (360 / this.barCount * i - count) % 360;
        let color = `hsl(${hue},95%,55%)`;
        let rotation = (count + i) % 360;
        let barX = this.barWidth * i;
        waves[i] = hyperHTML.wire(this, ':wave-' + i)`
          <div class=bar style=${[
            `width: ${this.barWidth}%`,
            `left: ${barX}%`,
            `transform: scale(0.8,.5) translateY(${translateY}%) rotate(${rotation}deg)`,
            `background-color: ${color}`
          ].join(';')}></div>
        `
      }
      return this.hyper`
        <div class="animated-sin-wave">${waves}</div>
        <p class=animated-sin-wave-description>
          The above animation is ${this.barCount} <code>&lt;div&gt;</code> tags.
          No SVG, no CSS transitions/animations.
          It's all powered by and small implementation of DOM update which update each wave style every frame.
        </p>
      `
    },
    observedAttributes() {
      return ['active']
    }
  }
  window.addEventListener('WebComponentsReady', function (e) {
    CreateComponent('sine-wave', SineWave)
  })
})()
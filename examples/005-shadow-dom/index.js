'use strict';

function GiphyApi (apiKey) {
  if (!apiKey) {
    throw new Error('apiKey must be provided.');
  }

  this.apiKey = apiKey;
}

GiphyApi.prototype.search = function search (search, offset = 0, limit = 20, rating = 'G', lang = 'en') {
  if (!search) {
    throw new Error('search must be provided.');
  }

  const url = 'https://api.giphy.com/v1/gifs/search?'
    + `api_key=${this.apiKey}`
    + `&q=${search}`
    + `&limit=${limit}`
    + `&offset=${offset}`
    + `&rating=${rating}`
    + `&lang=${lang}`;

  return fetch(url)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      return json.data
    })
}

const GiphySearch = {
  results: [],
  offset: {
    get () {
      return this.getAttribute('offset') || 0
    }
  },
  limit: {
    get () {
      return this.getAttribute('limit') || 20
    }
  },
  q: '',
  template: `
    <style>
        :host {
          display: block;
          contain: content; /* CSS containment FTW. */
        }
        :host-content(.dark) {
          background-color: black;
        }
        :host .giphy-search__input {
          font-size: 1.2em;
          padding: 0.5em 1em;
          margin-bottom: 1em;
          display: block;
          width: 100%;
          box-sizing: border-box;
        }
        :host .giphy-search__results {
          display: flex;
          flex-wrap: wrap;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          align-content: flex-start;
        }
        :host .giphy-search__results ::slotted(div) {
          display: flex;
          flex-wrap: wrap;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          align-content: flex-start;
        }
      </style>
      <form action="#">
        <input class="giphy-search__input" placeholder="What you want to search?" />
      </form>
      <div class="giphy-search__results">
        <slot>
        </slot>
      </div>
    `,
  render () {
    return this.results.map((result) => {
      return `<giphy-element src="${result.images.original.url}"></giphy-element>`
    }).join('')
  },
  search (search, offset = 0, limit) {
    this.GiphyApi.search(search, offset, limit)
      .then((results) => {
        this.results = results
        return this.updateComponent()
      })
  },
  events: {
    'keyup input': function (evnt) {
      this.q = evnt.target.value
    },
    'submit form': function (evnt) {
      evnt.preventDefault()
      this.search(this.q, this.offset, this.limit)
    }
  },
  connectedCallback () {
    this.GiphyApi = new GiphyApi(this.getAttribute('api-key'))
  },
  observedAttributes () {
    return ['offset', 'limit', 'api-key']
  }
}

const GiphyElement = {
  src: {
    get () {
      return this.getAttribute('src') || ''
    }
  },
  template: `
    <style>
      :host {
        display: flex;
        flex: auto;
        height: 200px;
        overflow: hidden;
      }
      :host ::slotted(img) {
        width: auto;
        max-height: 200px;
      }
    </style>
    <div class="giphy-search__gif">
      <slot></slot>
    </div>
  `,
  render () {
    return `<img src="${this.src}" />`
  },
  events: {},
  observedAttributes () {
    return ['src']
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  CreateComponent('giphy-search', GiphySearch)
  CreateComponent('giphy-element', GiphyElement)
})

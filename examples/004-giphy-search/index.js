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
  render () {
    const images = this.results.map((result) => {
      return `<giphy-element src="${result.images.original.url}"></giphy-element>`
    }).join('')
    return `
      <form>
        <input placeholder="What you want to search?" />
      </form>
      <div class="giphy-search__results">${images}</div>
    `
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
  render () {
    return `
      <div class="giphy-search__gif">
        <img src="${this.src}" />
      </div>
    `
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

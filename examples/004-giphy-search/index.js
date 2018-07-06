export default class GiphyApi {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('apiKey must be provided.');
    }

    this.apiKey = apiKey;
  }

  async search(search, limit = 10, offset = 0, rating = 'G', lang = 'en') {
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

    const response = await fetch(url);
    const json = await response.json();

    return json;
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  CreateComponent('giphy-search', {})
})

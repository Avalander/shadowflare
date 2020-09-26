const { patch } = require('./superfine')
const shadowflare = require('./core/main')

export default shadowflare(patch)

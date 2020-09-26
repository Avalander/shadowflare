import start, { makeRouter } from 'shadowflare'
import { div } from 'shadowflare/html'

import makeNavbar from './navbar'
import * as CounterPage from './counter.page'
import * as LoremPage from './lorem.page'


// Router

const router = makeRouter([{
	path: '/',
	view: LoremPage.view,
}, {
	path: '/lorem',
	view: LoremPage.view,
}, {
	path: '/counter',
	view: CounterPage.view,
	init: CounterPage.init,
}])

const navbar = makeNavbar(router)


// Init

const init = () => {
	const [ routerState, routerEffects ] = router.init()

	const state = {
		...routerState
	}

	return [ state, routerEffects ]
}


// View

const view = (state, dispatch) =>
	div([
		navbar(state, dispatch),
		router.render(state, dispatch),
	])


// App

start({
	init,
	view,
	node: document.querySelector('#app')
})

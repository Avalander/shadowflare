import shadowflare from 'shadowflare-core'
import { h, patch } from 'superfine'


const start = shadowflare(patch)


// Effects

const fetchJson = ([ url, { method, data }, onSuccess, onError ], dispatch) => {
	const options = {
		credentials: 'same-origin',
		mode: 'cors',
		method,
		headers: {
			Accept: 'application/json',
		},
		body: data != null
			? JSON.stringify(data)
			: undefined,
	}
	return fetch(url, options)
		.then(res => res.ok
			? res.json()
			: Promise.reject(res.status)
		)
		.then(data => dispatch([ onSuccess, data ]))
		.catch(error => dispatch([ onError, error ]))
}


// Actions

const setJoke = ({ error, ...state }, { joke }) => {
	const _state = {
		...state,
		joke,
	}

	return [ _state ]
}

const setError = (state, error) => {
	const _state = {
		...state,
		error,
	}

	return [ _state ]
}

const fetchJoke = state => {
	const _state = {
		...state,
		joke: 'Fetching...'
	}
	const effects = [
		[ fetchJson, 'https://icanhazdadjoke.com/', { method: 'GET' }, setJoke, setError ],
	]

	return [ _state, effects ]
}


// Init

const init = () => {
	const state = {
		joke: 'Press the button to load a joke...',
	}
	const effects = [
		[ fetchJson, 'https://icanhazdadjoke.com/', { method: 'GET' }, setJoke, setError ],
	]

	return [ state, effects ]
}


// View

const view = (state, dispatch) =>
	h('div', {}, [
		h('div', {}, state.error
			? state.error
			: state.joke
		),
		h('button', {
			onclick: () => dispatch([ fetchJoke ]),
		}, 'Get joke!'),
	])


// App

start({
	init,
	view,
	node: document.querySelector('#app'),
})

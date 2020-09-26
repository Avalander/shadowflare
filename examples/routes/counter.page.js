import {
	button,
	div,
	h1,
	h2,
} from 'shadowflare/html'


// Actions

const _changeCounterValue = (by, state) => ({
	...state,
	counter: {
		...state.counter,
		value: state.counter.value + by
	}
})

const updateCounter = (state, amount) => {
	const _state = _changeCounterValue(amount, state)
	const effects = []

	return [ _state, effects ]
}


// Init

export const init = () => {
	const state = {
		counter: {
			value: 0
		}
	}
	const effects = []

	return [ state, effects ]
}


// View

export const view = (state, dispatch) =>
	div([
		h1('Counter'),
		h2(state.counter.value.toString()),
		div([
			button({
				onclick: () => dispatch([ updateCounter, -1 ]),
			}, ' - '),
			button({
				onclick: () => dispatch([ updateCounter, 1 ]),
			}, ' + ')
		])
	])

Shadowflare is a minimalistic state management framework for web apps inspired by [hyperapp](https://hyperapp.dev/) and [the Elm architecture](https://guide.elm-lang.org/architecture/).

The architecture consists of a _view_ that dispatches _actions_ that update the _state_ which is rendered into a new _view_. _Actions_ are supposed to be pure and synchronous, but they can return a list of _effects_ (for example, executing an HTTP request or setting a timer), and _effects_ can dispatch _actions_ to hook back into the application.



# Example

We will create a page with a button to effect calls to the [icanhazdadjoke API](https://icanhazdadjoke.com/). Every time the button is pressed, the API will be invoked and the resulting joke will be displayed to the user.

To use the framework, first we need to provide a `patch` function, since it doesn't handle the VDOM. In this example we'll use [superfine](https://github.com/jorgebucaran/superfine), but [snabbdom](https://github.com/snabbdom/snabbdom) or any other library that exposes a similar `patch` function should work as well.

```javascript
import { h, patch } from 'superfine'
import shadowflare from 'shadowflare'

const start = shadowflare(patch)
```

`start` is a function that receives an object with three properties:
- `init`: a function returning the initial state and optionally a list of effects to be executed.
- `view`: a function that receives the state and returns a v-dom representation.
- `node`: the HTML element where the application will be mounted.

## The `init` function

Let's start by implementing our `init` function.

```javascript
const init = () => {
	const state = {
		joke: 'Press the button to fetch a joke...',
	}
	const effects = []

	return [ state, effects ]
}
```

## The `view` function

The `view` function receives the current state and a function `dispatch` used to trigger actions.

```javascript
const view = (state, dispatch) =>
	h('div', {}, [
		h('div', {}, state.error != null
			? state.error
			: state.joke
		),
		h('button', {}, 'Get joke!'),
	])
```

Now that we have the `init` and `view` functions implemented, we han pass them to the `start` function.

```javascript
start({
	init,
	view,
	node: document.querySelector('#app'),
})
```

## Implementing actions and effects

Now the application will render, but it is not loading jokes yet. Let's fix that.

First, we will implement an action called `fetchJoke` that we can trigger when the button is clicked.

```javascript
const fetchJoke = ({ error, ...state }) => {
	const _state = {
		...state,
		joke: 'Fetching joke...',
	}
	const effects = []
	
	return [ _state, effects ]
}

const view = (state, dispatch) =>
	h('div', {}, [
		...
		h('button', {
			onclick: () => dispatch([ fetchJoke ]),
		}, 'Get joke!'),
	])
```

An _action_ is a function that receives the current state plus any optional arguments it has been dispatched with and returns a new copy of the state and optionally a list of effects to execute.

Now the text is changing, but we are still not feching the joke. We need to add an _effect_ for that and return it from the action. Let's get down to it.

```javascript
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

const fetchJoke = ({ error, ...state }) => {
	const _state = {
		...state,
		joke: 'Fetching joke...',
	}
	const effects = [
		[ fetchJson, 'https://icanhazdadjoke.com/', { method: 'GET' }, setJoke, setError ],
	]
	
	return [ _state, effects ]
}
```

An _effect_ is a function that receives a list of arguments and the same function `dispatch` that the view receives, which can be used to dispatch new actions once the effect has been executed.

Now we need to implement two more actions that are dispatched from our effect: `setJoke` and `setError`.

```javascript
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
```

Note that if the action doesn't generate any effects, we don't need to add them to the returned array.

You can check the full example in the [examples folder](./examples/canihazjoke).

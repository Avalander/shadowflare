const tap = require('tap')

const shadowflare = require('./main').default

const emptyInit = () => [ '', []]
const dummyView = () => 'Potatoes'
const dummyNode = 'node'
const dummyPatch = (_, b) => b

tap.test('Invokes patch with the given node and the return of view', t => {
	const node = 'Onion'
	const patch = (a, b) => {
		t.equal(a, 'Onion', 'Passes the old node as first argument')
		t.equal(b, 'Potatoes', 'Passes the result of invoking view as second argument')
		t.end()
	}

	shadowflare(patch) ({
		init: emptyInit,
		view: dummyView,
		node,
	})
})

tap.test('Runs the effects returned by the init function', t => {
	const fx = (args, dispatch) => {
		t.deepEqual(args, [ 1, 2, 3 ], 'Passes the arguments to the effect')
		t.equal(typeof dispatch, 'function', 'Passes dispatch to the effect')
		t.end()
	}
	const init = () => {
		const state = {}
		const effects = [
			[ fx, 1, 2, 3 ],
		]
		return [ state, effects ]
	}

	shadowflare(dummyPatch) ({
		init,
		view: dummyView,
		node: dummyNode,
	})
})

tap.test('Calls view with the state returned by the init function', t => {
	const init = () => [ 'Carrots', []]
	const view = state => {
		t.equal(state, 'Carrots', 'Passes the current state to the view')
		t.end()
	}

	shadowflare(dummyPatch) ({
		init,
		view,
		node: dummyNode,
	})
})

tap.test('Dispatches actions from the view', t => {
	const action = (state, a, b) => {
		t.equal(state, '', 'Passes the current state to the action')
		t.equal(a, 1, 'Passes the arguments to the action')
		t.equal(b, 2, 'Passes the arguments to the action')

		return [ 'Done' ]
	}
	const view = (state, dispatch) => {
		if (state != 'Done') {
			setTimeout(() => {
				dispatch([ action, 1, 2 ])
			}, 100)
		}
		return state
	}
	const patch = (_, n) => {
		if (n == 'Done') t.end()
		return n
	}

	shadowflare(patch) ({
		init: emptyInit,
		view,
		node: dummyNode,
	})
})

tap.test('Runs effects from an action', t => {
	const fx = (args, dispatch) => {
		t.equal(typeof dispatch, 'function', 'Passes dispatch as second argument to the effect')
		t.deepEqual(args, [ 1, 2, 3 ], 'Passes the arguments to the effect')
		t.end()
	}
	const action = state => {
		return [ 'Done', [
			[ fx, 1, 2, 3 ],
		]]
	}
	const view = (state, dispatch) => {
		if (state != 'Done') {
			setTimeout(() => {
				dispatch([ action ])
			}, 100)
		}
		return state
	}

	shadowflare(dummyPatch) ({
		init: emptyInit,
		view,
		node: dummyNode,
	})
})

tap.test('Dispatches actions from an effect', t => {
	const action_1 = state => {
		const effects = [
			[ fx, state ],
		]
		return [ 'Done', effects ]
	}
	const action_2 = (state, ...args) => {
		t.deepEqual(args, [ 1, 2 ], 'Passes the arguments to the action triggered from the effect')
		t.end()
		return [ state ]
	}
	const fx = (args, dispatch) => {
		t.deepEqual(args, [ '' ], 'Passes the arguments to the effect')
		dispatch([ action_2, 1, 2 ])
	}
	const view = (state, dispatch) => {
		if (state != 'Done') {
			setTimeout(() => {
				dispatch([ action_1 ])
			}, 100)
		}
		return state
	}

	shadowflare(dummyPatch) ({
		init: emptyInit,
		view,
		node: dummyNode,
	})
})

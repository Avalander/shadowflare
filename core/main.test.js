const tap = require('tap')

const shadowflare = require('./main').default

const emptyInit = () => [ '', []]
const dummyView = () => 'Potatoes'
const dummyNode = 'node'
const dummyPatch = (_, b) => b

tap.test('Invokes patch with the given node and the return of view', t => {
	const node = 'Onion'
	const patch = (a, b) => {
		t.equal(a, 'Onion')
		t.equal(b, 'Potatoes')
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
		t.deepEqual(args, [ 1, 2, 3 ])
		t.equal(typeof dispatch, 'function')
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
		t.equal(state, 'Carrots')
		t.end()
	}

	shadowflare(dummyPatch) ({
		init,
		view,
		node: dummyNode,
	})
})

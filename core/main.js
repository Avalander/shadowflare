'use strict'

export default patch => ({ init, view, node }) => {
	let [ _state, _e ] = init()
	let _node = node

	const dispatch = ([ action, ...args ]) => {
		const [ state, _effects = [] ] = action(_state, ...args)
		setState(state)
		_effects.forEach(([ e, ...args ]) => e(args, dispatch))
	}

	const setState = state => {
		_state = state
		_node = patch(_node, view(_state, dispatch))
	}

	setState(_state)
	_e.forEach(([ e, ...args ]) => e(args, dispatch))
}

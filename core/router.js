'use strict'


const setLocation = (location, extra = {}) => state => [{
	...state,
	...extra,
	location,
}, []]

const zip = (a, b) => {
	const result = []
	const len = Math.max(a.length, b.length)
	for (let i = 0; i < len; i++) {
		result.push([ a[i], b[i] ])
	}
	return result
}

const isParam = path => path.startsWith(':')

const trimPath = path => path.endsWith('/') && path.length > 1
	? path.substring(0, path.length - 1)
	: path

const canHandle = ({ location }) => ({ path }) => {
	const loc_parts = trimPath(location).split('/')
	const path_parts = path.split('/')

	return loc_parts.length === path_parts.length && canHandlePath(loc_parts, path_parts)
}

const canHandlePath = (location, path) => {
	const parts = zip(location, path)
	return parts.every(([location, path]) => isParam(path) || location === path)
}

const getParams = ({ location }, { path }) => {
	const parts = zip(
		trimPath(location).split('/'),
		path.split('/')
	)
	return parts.reduce(
		(prev, [location, path]) =>
			prev === false
				? prev
				: isParam(path)
				? Object.assign(prev, { [path.substring(1)]: location })
				: location === path
				? prev
				: false,
		{}
	)
}

export default routes => {
	const initRoute = location => {
		const route = routes.find(canHandle({ location }))
		const params = getParams({ location }, route)
		return typeof route.init === 'function'
			? route.init(params)
			: [{}, []]
	}

	const triggerLocation = location => state => [ state, [
		[ fx.goTo, location ],
	]]

	const init = () => {
		const location = window.location.pathname
		const [ state, effects ] = initRoute(location)

		return [{
			...state,
			location,
		}, [
			[ setupListener ],
			...effects
		]]
	}

	const setupListener = (_, dispatch) => {
		window.addEventListener('popstate', ev => {
			dispatch(triggerLocation(ev.state.location))
		})
	}

	const fx = {
		goTo: ([ path ], dispatch) => {
			window.history.pushState({ location: path }, '', path)
			const [ state, effects ] = initRoute(path)
			effects.forEach(([ e, ...params ]) => e(params, dispatch))

			return dispatch(setLocation(path, state))
		},
		back: (_, dispatch) => {
			window.history.back()
		},
	}

	const render = (state, dispatch) => {
		const route = routes.find(canHandle(state))
		const params = getParams(state, route)
		return route.view(state, dispatch, params)
	}

	return {
		init,
		fx,
		render,
	}
}

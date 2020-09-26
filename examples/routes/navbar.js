import { h } from 'superfine'


export default router => {
	const goToPage = (state, page) => {
		const effects = [
			[ router.fx.goTo, page ],
		]

		return [ state, effects ]
	}

	return (state, dispatch) =>
		h('nav', {}, [
			h('a', {
				href: '/lorem',
				onclick: ev => {
					ev.preventDefault()
					dispatch([ goToPage, '/lorem' ])
				},
			}, 'Lorem'),
			h('a', {
				href: '/counter',
				onclick: ev => {
					ev.preventDefault()
					dispatch([ goToPage, '/counter' ])
				},
			}, 'Counter')
		])
}

import {
	a,
	nav,
} from 'shadowflare/html'


export default router => {
	const goToPage = (state, page) => {
		const effects = [
			[ router.fx.goTo, page ],
		]

		return [ state, effects ]
	}

	return (state, dispatch) =>
		nav([
			a({
				href: '/lorem',
				onclick: ev => {
					ev.preventDefault()
					dispatch([ goToPage, '/lorem' ])
				},
			}, 'Lorem'),
			a({
				href: '/counter',
				onclick: ev => {
					ev.preventDefault()
					dispatch([ goToPage, '/counter' ])
				},
			}, 'Counter')
		])
}

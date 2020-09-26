import { h } from 'superfine'


export const view = (state, dispatch) =>
	h('div', {}, [
		h('h1', {}, 'Lorem Ipsum'),
		h('p', {}, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin tortor turpis, ullamcorper et nisl nec, semper hendrerit purus. Phasellus pretium orci eros, sit amet euismod massa sagittis sed.'),
	])

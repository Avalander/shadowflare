import {
	div,
	h1,
	p,
} from 'shadowflare/html'

export const view = (state, dispatch) =>
	div([
		h1('Lorem Ipsum'),
		p('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin tortor turpis, ullamcorper et nisl nec, semper hendrerit purus. Phasellus pretium orci eros, sit amet euismod massa sagittis sed.'),
	])

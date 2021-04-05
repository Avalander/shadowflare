import start from 'shadowflare'
import { svg } from 'shadowflare/html'
import {
	g,
	rect,
	text,
} from 'shadowflare/svg'


const SIZE = 15
const WIDTH = SIZE * 45
const HEIGHT = SIZE * 32

const COLORS = {
	background: {
		flat: '#088c64',
		shade: '#077449',
	},
	snake: {
		fill: '#bcaba0',
		stroke: '#706660',
	},
	apple: {
		fill: '#ff5a5f',
		stroke: '#b23e42',
	},
}

const DIRECTIONS = {
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
}

const OPPOSITE_DIRECTION = {
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left',
}

const APPLE_POINTS =
	[ 0, 5, 5, 10, 10, 10, 10, 10, 10, 20, 20, 30 ]


// Init

const init = () => {
	const state = {
		snake: [
			{ x: 3 * SIZE, y: 3 * SIZE },
			{ x: 2 * SIZE, y: 3 * SIZE },
			{ x: 1 * SIZE, y: 3 * SIZE },
		],
		direction: 'right',
		next_direction: 'right',
		apple: { x: 20 * SIZE, y: 4 * SIZE, score: 10 },
		score: 0,
		is_running: true,
		update_interval: 150,
	}
	const effects = [
		[ bindKeys ],
		[ frame, 150 ],
	]

	return [ state, effects ]
}


// Utils

const collision = (a, b) =>
	a.x == b.x && a.y == b.y

const last = xs => xs[xs.length - 1]

const pipe = (...fns) => data =>
	fns.reduce(
		(prev, fn) => fn(prev),
		data
	)

const randInt = (from, to) =>
	Math.floor(Math.random() * (to - from) + from)

const randPoint = () => ({
	x: randInt(0, WIDTH/SIZE) * SIZE,
	y: randInt(0, HEIGHT/SIZE) * SIZE,
})

const withScore = x => ({
	...x,
	score: APPLE_POINTS[randInt(0, APPLE_POINTS.length)]
})

const excludePoints = (exclude, point) =>
	exclude.some(x => collision(x, point))
		? excludePoints(exclude, randPoint())
		: point

const makeApple = snake =>
	withScore(
		excludePoints(snake, randPoint())
	)

const selfCollision = ([ head, ...tail ]) =>
	tail.some(x => collision(x, head))


// Actions

const _updateDirection = state => ({
	...state,
	direction: state.next_direction,
})

const _updateSnake = state => {
	const { snake } = state
	const [ head ] = snake
	const tail = snake.pop()

	tail.x = head.x + SIZE * DIRECTIONS[state.direction].x
	tail.y = head.y + SIZE * DIRECTIONS[state.direction].y

	if (tail.x < 0) tail.x = WIDTH - SIZE
	if (tail.x >= WIDTH) tail.x = 0
	if (tail.y < 0) tail.y = HEIGHT - SIZE
	if (tail.y >= HEIGHT) tail.y = 0

	snake.unshift(tail)

	return {
		...state,
		snake,
	}
}

const _checkEatApple = state =>
	collision(state.snake[0], state.apple)
		? eatApple(state)
		: state

const _gameOver = state => {
	const _state = {
		...state,
		is_running: false,
	}

	return [ _state, []]
}

const _nextFrame = state => {
	const effects = [
		[ frame, state.update_interval ],
	]

	return [ state, effects ]
}

const _continue = state =>
	selfCollision(state.snake)
		? _gameOver(state)
		: _nextFrame(state)

const update =
	pipe(
		_updateDirection,
		_updateSnake,
		_checkEatApple,
		_continue,
	)

const _growSnake = state => ({
	...state,
	snake: state.snake.concat({ ...last(state.snake) })
})

const _updateScore = state => ({
	...state,
	score: state.score + state.apple.score,
})

const _updateSpeed = state => ({
	...state,
	update_interval: (Math.floor(state.score / 100) > Math.floor((state.score - state.apple.score) / 100)
		? Math.round(state.update_interval * 0.9)
		: state.update_interval)
})

const _relocateApple = state => ({
	...state,
	apple: makeApple(state.snake),
})

const eatApple =
	pipe(
		_growSnake,
		_updateScore,
		_updateSpeed,
		_relocateApple,
	)

const setNextDirection = (state, direction) => {
	const _state = OPPOSITE_DIRECTION[direction] == state.direction
		? state
		: {
			...state,
			next_direction: direction,
		}
	const effects = []

	return [ _state, effects ]
}

const restartIfOver = state => {
	if (state.is_running) {
		return [ state, []]
	}
	const [ _state ] = init()
	const effects = [
		[ frame, 150 ],
	]

	return [ _state, effects ]
}


// Effects

const KEY_ACTIONS = {
	ArrowUp: [ setNextDirection, 'up' ],
	ArrowDown: [ setNextDirection, 'down' ],
	ArrowLeft: [ setNextDirection, 'left' ],
	ArrowRight: [ setNextDirection, 'right' ],
	r: [ restartIfOver ],
}

const bindKeys = (_, dispatch) => {
	document.addEventListener('keydown', ev => {
		const action = KEY_ACTIONS[ev.key]
		if (action != null) {
			dispatch(action)
		}
	})
}

const frame = ([ delay ], dispatch) => {
	setTimeout(() => {
		dispatch([ update ])
	}, delay)
}


// View

const view = (state, dispatch) =>
	svg({ viewBox: `0 0 ${WIDTH} ${HEIGHT}`, width: WIDTH, height: HEIGHT }, [
		Background(),
		Apple(state),
		Snake(state),
		state.is_running
			? Score(state)
			: GameOver(state),
		Speed(state),
	])

const _speckles = new Array(randInt(50, 100))
	.fill(0)
	.map(randPoint)
	.map(x => rect({
		...x,
		width: randInt(3, 6),
		height: randInt(3, 6),
		fill: COLORS.background.shade,
	}))

const Background = () =>
	g({ key: 'background' }, [
		rect({
			x: 0, y: 0,
			width: WIDTH,
			height: HEIGHT,
			fill: COLORS.background.flat,
		}),
		..._speckles,
	])

const Apple = ({ apple: { x, y }}) =>
	g({ key: 'apple' }, [
		rect({
			x, y,
			width: SIZE,
			height: SIZE,
			fill: COLORS.apple.fill,
			stroke: COLORS.apple.stroke,
			'stroke-width': 2,
		}),
	])

const Snake = ({ snake }) =>
	g({ key: 'snake' },
		snake.map(SnakeCell)
	)

const SnakeCell = ({ x, y }) =>
	rect({
		x, y,
		width: SIZE,
		height: SIZE,
		fill: COLORS.snake.fill,
		stroke: COLORS.snake.stroke,
		'stroke-width': 2,
	})

const score_style = {
	font: 'bold 20px sans-seriff',
	fill: '#fff',
	opacity: 0.8,
}

const Score = ({ score }) =>
	g({ key: 'score' }, [
		text({
			style: score_style,
			x: 5, y: 20,
		}, `Score: ${score}`),
	])

const Speed = ({ update_interval }) =>
	g({ key: 'speed' }, [
		text({
			style: score_style,
			x: WIDTH - 100, y: 20,
		}, `Speed: ${update_interval}`),
	])

const game_over_style = {
	title: {
		font: 'bold 48px sans-seriff',
		fill: '#fff',
		opacity: 0.8,
		'text-anchor': 'middle',
	},
	text: {
		font: '30px sans-seriff',
		fill: '#fff',
		opacity: 0.8,
		'text-anchor': 'middle',
	}
}

const GameOver = ({ score }) =>
	g({ key: 'game-over'}, [
		rect({
			x: 0, y: 0, width: WIDTH, height: HEIGHT,
			fill: '#000',
			opacity: 0.4,
		}),
		text({
			style: game_over_style.title,
			x: WIDTH/2, y: 100,
		}, 'Game Over'),
		text({
			style: game_over_style.text,
			x: WIDTH/2, y: 160,
		}, `Score: ${score}`),
		text({
			style: game_over_style.text,
			x: WIDTH/2, y: 200,
		}, `Press 'R' to restart`),
	])


// App

start({
	init,
	view,
	node: document.querySelector('#app'),
})

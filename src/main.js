import { patch } from './superfine'
import shadowflare from './core/main'
import router from './core/router'


export default shadowflare(patch)

export const makeRouter = router

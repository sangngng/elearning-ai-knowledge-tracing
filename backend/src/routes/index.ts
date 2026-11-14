import { Router } from 'express'
import { academicRouter } from './academic'
import { authRouter } from './auth'
import { quizRouter } from './quizzes'

export const apiRouter = Router()

// Public routes first. academicRouter authenticates every request that reaches it, so it stays last.
apiRouter.use(authRouter)
apiRouter.use(quizRouter)
apiRouter.use(academicRouter)

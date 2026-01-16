import { validateRequest } from '@app/middlewares'
import express, { Router } from 'express'
import { AuthValidations } from './user.validations'

const router: Router = express()

// 1. Sign up route:
router.post('/sign-up', validateRequest(AuthValidations.signUserSchema), )

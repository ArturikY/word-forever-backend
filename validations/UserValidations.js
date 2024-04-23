import { body } from 'express-validator'

export const loginValid = [
	body('login', 'Invalid login format').isEmail(),
	body('password', 'Password must have 6 symbols').isLength({ min: 6 }),
]

export const registerValid = [
	body('login', 'Invalid login format').isEmail(),
	body('password', 'Password must have 6 symbols').isLength({ min: 6 }),
	body('child_name', 'Child name must be string').isString(),
]

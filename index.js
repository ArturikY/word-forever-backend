import cors from 'cors'
import express from 'express'
import fs from 'fs'
import path from 'path'

import {
	CardsController,
	StatisticsController,
	UserController,
	WordsController,
} from './controllers/controllers.js'
import { checkAuth, handleValidationErrors } from './utils/utils.js'
import { UserValidations } from './validations/validations.js'

const app = express()

app.use(express.json())
app.use(cors())
// FIXME:
let lastModified = null

function checkFileModification() {
	fs.stat('../server-side/words.xlsx', (err, stats) => {
		if (err) return

		if (!lastModified || lastModified.getTime() !== stats.mtime.getTime()) {
			console.log('Файл был изменен. Выполняем действие...')
			WordsController.addWords()
			lastModified = stats.mtime
		}
	})
}
const interval = setInterval(checkFileModification, 1 * 60 * 1000) // Каждые 5 секунд

setTimeout(() => {
	clearInterval(interval)
}, 1 * 60 * 1000) // 10 минут

app.post(
	'/api/auth/login',
	UserValidations.loginValid,
	handleValidationErrors,
	UserController.login
)
app.post(
	'/api/auth/register',
	UserValidations.registerValid,
	handleValidationErrors,
	UserController.register
)
app.get('/api/auth/me', checkAuth, UserController.getMe)
app.patch(
	'/api/auth/update',
	checkAuth,
	UserValidations.registerValid,
	handleValidationErrors,
	UserController.updateMe
)
app.patch('/api/auth/pay', checkAuth, UserController.pay)
// FIXME:
app.delete('/api/auth/delete', checkAuth, UserController.remove)

app.post('/api/cards', checkAuth, CardsController.create)
app.get('/api/cards', CardsController.getAll)
app.get('/api/cards/:id', CardsController.getOne)
// FIXME:
app.patch('/api/cards/:id', CardsController.update)

app.get('/api/words', WordsController.getAll)

// FIXME:
// app.get('/api/statistics', StatisticsController.getAll)
app.put('/api/statistics', checkAuth, StatisticsController.update)

app.listen(5000, err => {
	if (err) {
		return console.log(err)
	}

	console.log('Server Ok')
})

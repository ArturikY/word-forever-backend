import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
// FIXME:
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// FIXME:
export const register = async (req, res) => {
	try {
		const password = req.body.password
		const salt = await bcrypt.genSalt(13)
		const passwordHash = await bcrypt.hash(password, salt)

		const user = await prisma.user.create({
			data: {
				login: req.body.login,
				password: passwordHash,
				child_name: req.body.child_name,
			},
		})

		const token = jwt.sign(
			{
				id: user.id,
			},
			'words_secret_123',
			{
				expiresIn: '30d',
			}
		)

		const { pass, ...resUser } = user

		res.json({ resUser, token })
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed registration',
		})
	}
}

// FIXME:
export const login = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				login: req.body.login,
			},
		})

		if (!user) {
			return res.status(404).json({
				message: 'Invalid login or password',
			})
		}

		const isValidPass = await bcrypt.compare(req.body.password, user.password)

		if (!isValidPass) {
			return res.status(404).json({
				message: 'Invalid login or password',
			})
		}

		const token = jwt.sign(
			{
				id: user.id,
			},
			'words_secret_123',
			{
				expiresIn: '30d',
			}
		)

		user.password = ''

		res.json({ user, token })
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed authorization',
		})
	}
}

// FIXME:
export const getMe = async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.userId,
			},
			include: {
				statistics: {
					orderBy: {
						errors_count: 'desc',
					},
				},
				cards: true,
			},
		})

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		user.password = ''
		res.json(user)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'No access',
		})
	}
}

// FIXME:
export const updateMe = async (req, res) => {
	try {
		const password = req.body.password
		const salt = await bcrypt.genSalt(13)
		const passwordHash = await bcrypt.hash(password, salt)

		const user = await prisma.user.update({
			where: {
				id: req.userId,
			},
			data: {
				login: req.body.login,
				password: passwordHash,
				child_name: req.body.child_name,
			},
			// TODO:
			include: {
				statistics: true,
				cards: true,
			},
		})
		user.password = ''
		console.log(user)

		res.json({
			success: true,
			user,
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to update a user',
		})
	}
}

// FIXME:
export const pay = async (req, res) => {
	try {
		const user = await prisma.user.update({
			where: {
				id: req.userId,
			},
			data: {
				date_over: req.body.date_over,
				isTrial: true,
				tariff: req.body.tariff,
			},
		})

		user.password = ''

		res.json({
			user,
			success: true,
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to pay',
		})
	}
}

// FIXME:
export const remove = async (req, res) => {
	try {
		await prisma.card.deleteMany({
			where: {
				userId: req.userId,
			},
		})
		await prisma.statistics.deleteMany({
			where: {
				userId: req.userId,
			},
		})

		const user = await prisma.user.delete({
			where: {
				id: req.userId,
			},
		})

		if (!user) {
			return res.status(404).json({ message: 'User not found' })
		}

		res.json({
			success: true,
		})
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to remove user',
		})
	}
}

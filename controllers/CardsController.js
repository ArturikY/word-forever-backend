import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const create = async (req, res) => {
	try {
		const card = await prisma.card.create({
			data: {
				words: req.body.words,
				user: { connect: { id: req.userId } },
			},
			include: {
				user: true,
			},
		})
		res.json(card)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to create a card',
		})
	}
}

export const getAll = async (req, res) => {
	try {
		const cards = await prisma.card.findMany()
		res.json(cards)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to get cards',
		})
	}
}

export const getOne = async (req, res) => {
	try {
		const cardId = parseInt(req.params.id)
		const card = await prisma.card.findUnique({
			where: { id: cardId },
			include: {
				user: true,
			},
		})

		if (!card) {
			return res.status(500).json({
				message: 'Failed to find a card',
			})
		}

		res.json(card)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to get a card',
		})
	}
}

// FIXME:
export const update = async (req, res) => {
	try {
		const cardId = parseInt(req.params.id)
		const card = await prisma.card.update({
			where: {
				id: cardId,
			},
			data: {
				words: req.body.words,
			},
			include: {
				user: true,
			},
		})

		if (!card) {
			return res.status(500).json({
				message: 'Failed to find a card',
			})
		}

		res.json(card)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to update a card',
		})
	}
}

/* export const remove = async (req, res) => {
	try {
		const card = await prisma.card.delete({
			where: {
				id:
			}
		})
	} catch (err) {
		
	}
} */

import { PrismaClient } from '@prisma/client'
import { wordsParsing } from '../utils/wordsParsing.js'

const prisma = new PrismaClient()

export const getAll = async (req, res) => {
	try {
		const words = await prisma.word.findMany()
		res.json(words)
		console.log('words:', words)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to get words',
		})
	}
}

// FIXME:
export const addWords = async (req, res) => {
	try {
		const words = await wordsParsing()
		await prisma.word.deleteMany({})

		for (const word of words) {
			await prisma.word.create({
				data: {
					name: word.name,
					letters: word.letters,
				},
			})
		}

		res.json({
			success: true,
		})
	} catch (err) {
		console.log(err)
	}
}

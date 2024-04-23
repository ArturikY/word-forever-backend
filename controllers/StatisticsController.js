import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// FIXME:
export const update = async (req, res) => {
	try {
		const newWords = req.body.words

		// Получаем текущую статистику пользователя
		const user = await prisma.user.findUnique({
			where: {
				id: req.userId,
			},
			include: {
				statistics: true,
			},
		})

		// Формируем массив объектов для обновления статистики
		const statisticsUpdateData = newWords
			.map(word => {
				const existingStatistic = user.statistics.find(
					statistic => statistic.word === word
				)
				if (existingStatistic) {
					return {
						where: { id: existingStatistic.id }, // Используем ID существующей статистики для обновления
						data: { errors_count: existingStatistic.errors_count + 1 }, // Увеличиваем счетчик ошибок на 1
					}
				} else {
					return null // Не обновляем существующую статистику
				}
			})
			.filter(stat => stat !== null) // Фильтруем пустые элементы (для слов, которых нет в текущей статистике)

		// Обновляем статистику пользователя
		await prisma.statistics.updateMany({
			where: {
				id: { in: statisticsUpdateData.map(stat => stat.where.id) }, // Используем ID для фильтрации
			},
			data: {
				errors_count: { increment: 1 }, // Увеличиваем счетчик ошибок на 1
			},
		})

		// Создаем новые записи статистики
		const newStatistics = newWords.filter(
			word => !user.statistics.some(stat => stat.word === word)
		)
		for (let word of newStatistics) {
			await prisma.statistics.create({
				data: {
					word: word,
					errors_count: 1,
					userId: req.userId,
				},
			})
		}

		// Получаем обновленные данные статистики пользователя
		const updatedUser = await prisma.user.findUnique({
			where: {
				id: req.userId,
			},
			include: {
				statistics: true,
			},
		})

		res.json(updatedUser.statistics)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to update statistics',
		})
	}
}

/* export const create = async (req, res) => {
	try {
		const card = await prisma.statistics.create({
			data: {
				word: req.body.word,
				errors_count: req.body.errors_count,
				user: { connect: { id: req.userId } },
			},
			include: {
				user: include,
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
		const statistics = await prisma.statistics.findMany()
		res.json(statistics)
	} catch (err) {
		console.log(err)
		res.status(500).json({
			message: 'Failed to get statistics',
		})
	}
} */

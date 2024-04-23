import xlsx from 'xlsx'

export const wordsParsing = async () => {
	try {
		// Загрузить файл Excel
		const workbook = xlsx.readFile('../server-side/words.xlsx')

		// Получить первый лист
		const worksheet = workbook.Sheets[workbook.SheetNames[0]]
		console.log(worksheet)

		// Преобразовать данные из листа в формат JSON
		const data = xlsx.utils.sheet_to_json(worksheet)

		const words = []

		// Пройтись по данным и создать объекты
		data.forEach(row => {
			// console.log(row)
			const name = row['Слово']
			const xlsx_letters = row['Буквы']
			let letters

			if (typeof xlsx_letters === 'number') {
				// Если letters - число, вычтем из него единицу и преобразуем в строку
				letters = (xlsx_letters - 1).toString()
			} else if (typeof xlsx_letters === 'string') {
				// Если letters - строка, разделим ее по пробелу,
				// вычтем из каждого числа единицу и снова преобразуем в строку
				const numbers = xlsx_letters.split(' ')
				const decrementedNumbers = numbers.map(num =>
					(parseInt(num) - 1).toString()
				)
				letters = decrementedNumbers.join(' ')
			} else {
				// Если тип данных не соответствует ожидаемым, присвоим переменной пустую строку
				letters = ''
			}

			// Создать объект и добавить его в массив
			const obj = {
				name,
				letters,
			}
			words.push(obj)
			console.log(words)
		})

		return words
	} catch (error) {
		console.error('Произошла ошибка при чтении файла Excel:', error)
		throw error // Пробросить ошибку для дальнейшей обработки
	}
}

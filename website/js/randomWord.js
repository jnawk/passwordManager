const uniqueRandomArray = require('unique-random-array')
import * as txt from './words.txt'
const randomWord = uniqueRandomArray(txt.split('\n'))
export default randomWord

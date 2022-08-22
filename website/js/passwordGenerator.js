import randomWord from './randomWord.js'

const allCharacters = Array.from({ length:126 }, (v,k) => k + 1)
    .map(i => String.fromCharCode(i))
const upperCharacters = allCharacters.slice(64, 90)
const lowerCharacters = allCharacters.slice(96, 122)
const numbers = allCharacters.slice(47, 57)
const wankCharacters = allCharacters.slice(31, 47)
    .concat(allCharacters.slice(57, 64))
    .concat(allCharacters.slice(90, 96))
    .concat(allCharacters.slice(122, 126))

export const generatePassword = ({
    wankCharacterCount,
    upperCharacterCount,
    lowerCharacterCount,
    numeralCount,
    length
}) => {
    let ourCharacters = []
    if(wankCharacterCount > 0) {
        ourCharacters = ourCharacters.concat(wankCharacters)
    }
    if(upperCharacterCount > 0) {
        ourCharacters = ourCharacters.concat(upperCharacters)
    }
    if(lowerCharacterCount > 0) {
        ourCharacters = ourCharacters.concat(lowerCharacters)
    }
    if(numeralCount > 0) {
        ourCharacters = ourCharacters.concat(numbers)
    }
    const then = new Date().getTime()
    while(new Date().getTime() - then < 1000) {
        let values = new Uint8Array(length)
        window.crypto.getRandomValues(values)
        let result = ''
        let statistics = {
            wankCharacters: 0,
            upperCharacters: 0,
            lowerCharacters: 0,
            numerals: 0
        }
        for(let i = 0; i < length; ++i) {
            let nextChar = ourCharacters[values[i] % ourCharacters.length] // eslint-disable-line security/detect-object-injection
            if(wankCharacters.includes(nextChar)) {
                statistics.wankCharacters = statistics.wankCharacters + 1
            } else if(upperCharacters.includes(nextChar)) {
                statistics.upperCharacters = statistics.upperCharacters + 1
            } else if(lowerCharacters.includes(nextChar)) {
                statistics.lowerCharacters = statistics.lowerCharacters + 1
            } else {
                statistics.numerals = statistics.numerals + 1
            }
            result += nextChar
        }
        if(statistics.wankCharacters >= wankCharacterCount &&
            statistics.upperCharacters >= upperCharacterCount &&
            statistics.lowerCharacters >= lowerCharacterCount &&
            statistics.numerals >= numeralCount
        ) {
            return {
                generatedPassword: result,
                passwordGenerateFailure: false
            }
        }
    }
    return { passwordGenerateFailure: true }
}

export const generatePassphrase = ({ wordCount }) => {
    return Array.from({length: wordCount}, () => 1).map(randomWord).join(' ')
}

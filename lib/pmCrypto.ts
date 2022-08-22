import * as crypto from 'crypto'

export function encrypt(data: string, password: string): string {
    const cipher = crypto.createCipher('aes192', Buffer.from(password, 'binary'))
    let buf = cipher.update(data, 'utf-8', 'base64')
    buf += cipher.final('base64')
    return buf
}

export function decrypt(data: string, password: string): string {
    const cipher = crypto.createDecipher('aes192', Buffer.from(password, 'binary'))
    let buf = cipher.update(data, 'base64', 'utf-8')
    buf += cipher.final('utf-8')
    return buf
}

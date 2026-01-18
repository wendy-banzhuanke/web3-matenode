import CryptoJS from "crypto-js"

const SALT = "YourStaticSaltValue" // TODO 修改成从环境变量读取

export const encryptData = (data: string, password: string) => {
  const saltedPassword = password + SALT
  return CryptoJS.AES.encrypt(data, saltedPassword).toString()
}

export const decryptData = (encrypted: string, password: string) => {
  try {
    const saltedPassword = password + SALT
    const bytes = CryptoJS.AES.decrypt(encrypted, saltedPassword)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return null
  }
}
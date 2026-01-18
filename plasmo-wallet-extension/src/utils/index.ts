export const checkPasswordStrength = (pw: string) => {
  return pw.length >= 8 && 
         /[A-Z]/.test(pw) && 
         /[a-z]/.test(pw) && 
         /[0-9]/.test(pw)
}
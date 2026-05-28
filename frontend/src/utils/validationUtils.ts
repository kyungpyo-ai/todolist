export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

export function getPasswordError(password: string): string | null {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
  if (!/[a-zA-Z]/.test(password)) return '비밀번호는 영문자를 포함해야 합니다.';
  if (!/[0-9]/.test(password)) return '비밀번호는 숫자를 포함해야 합니다.';
  return null;
}

export function getEmailError(email: string): string | null {
  if (!email) return '이메일을 입력해주세요.';
  if (!isValidEmail(email)) return '올바른 이메일 형식이 아닙니다.';
  return null;
}

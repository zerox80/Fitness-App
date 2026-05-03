export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  },
  password: {
    minLength: 8,
    message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
  },
  displayName: {
    minLength: 2,
    maxLength: 50,
    message: 'Der Name muss zwischen 2 und 50 Zeichen lang sein.',
  },
  workoutTitle: {
    minLength: 1,
    maxLength: 100,
    message: 'Der Titel muss zwischen 1 und 100 Zeichen lang sein.',
  },
};

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-Mail ist erforderlich.';
  if (!ValidationRules.email.pattern.test(email)) return ValidationRules.email.message;
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Passwort ist erforderlich.';
  if (password.length < ValidationRules.password.minLength) return ValidationRules.password.message;
  return null;
}

export function validateDisplayName(name: string): string | null {
  if (!name.trim()) return 'Name ist erforderlich.';
  if (name.length < ValidationRules.displayName.minLength || name.length > ValidationRules.displayName.maxLength) {
    return ValidationRules.displayName.message;
  }
  return null;
}

export function validateWorkoutTitle(title: string): string | null {
  if (!title.trim()) return 'Titel ist erforderlich.';
  if (title.length > ValidationRules.workoutTitle.maxLength) return ValidationRules.workoutTitle.message;
  return null;
}

export interface FormErrors {
  [key: string]: string | null;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((e) => e !== null && e !== undefined);
}

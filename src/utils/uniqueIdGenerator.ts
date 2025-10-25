export function generateUniqueSavingsId(): string {
  // Generate a random number between 100000 (6 digits) and 999999
  const min = 100000;
  const max = 999999;
  
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function generateUniqueAccountNumber(): string {
  // Generate a random number between 1000000000 (10 digits) and 9999999999
  const min = 1000000000;
  const max = 9999999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
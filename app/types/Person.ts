// app/types/Person.ts
// app/types/Person.ts
export type GenderType = 'MALE' | 'FEMALE';

export interface Person {
  cin: string;
  address: string;
  phoneNumber: string;
  email: string;
  gender: GenderType;
  dateOfBirth: string;
}
export type PersonKeys = keyof Person;
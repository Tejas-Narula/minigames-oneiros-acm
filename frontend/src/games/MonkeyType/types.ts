
export interface Theme {
  id: string;
  name: string;
  bgColor: string;
  mainColor: string;
  caretColor: string;
  subColor: string;
  textColor: string;
  errorColor: string;
  successColor: string;
}

export interface TestResult {
  wpm: number;
  accuracy: number;
  rawWpm: number;
  characters: number;
  errors: number;
  time: number;
  history: { time: number; wpm: number }[];
  passed: boolean;
}

export interface TestSettings {
  theme: string;
}

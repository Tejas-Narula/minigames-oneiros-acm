
import { Theme } from './types';

export const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", 
  "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", 
  "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", 
  "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", 
  "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "are", "was", "were"
];

export const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Carbon',
    bgColor: '#323437',
    mainColor: '#e2b714',
    caretColor: '#e2b714',
    subColor: '#646669',
    textColor: '#d1d0c5',
    errorColor: '#ca4754',
    successColor: '#4ade80'
  },
  {
    id: 'light',
    name: 'Paper',
    bgColor: '#eeeeee',
    mainColor: '#444444',
    caretColor: '#444444',
    subColor: '#b2b2b2',
    textColor: '#444444',
    errorColor: '#d45a60',
    successColor: '#22c55e'
  },
  {
    id: 'serika-dark',
    name: 'Serika Dark',
    bgColor: '#1d1e20',
    mainColor: '#e2b714',
    caretColor: '#e2b714',
    subColor: '#646669',
    textColor: '#d1d0c5',
    errorColor: '#ca4754',
    successColor: '#4ade80'
  },
  {
    id: 'nord',
    name: 'Nord',
    bgColor: '#2e3440',
    mainColor: '#88c0d0',
    caretColor: '#88c0d0',
    subColor: '#4c566a',
    textColor: '#d8dee9',
    errorColor: '#bf616a',
    successColor: '#a3be8c'
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    bgColor: '#f3e5f5',
    mainColor: '#d81b60',
    caretColor: '#d81b60',
    subColor: '#ad1457',
    textColor: '#880e4f',
    errorColor: '#b71c1c',
    successColor: '#2e7d32'
  }
];

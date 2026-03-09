import { calculateORP, calculateWordDelay } from './src/engine/textProcessor.js';

const testWords = [
    "I", "am", "the", "book", "apple", "center", "lengths", "eightlen", "ninechars", "tenletters", "elevenchars", "twelveletter", "thirteenchars", "pseudoantihypoparathyroidism"
];

console.log("=== ORP Calculation Tests ===");
testWords.forEach(word => {
    const { left, center, right } = calculateORP(word);
    console.log(`[${word.padEnd(30, ' ')}] => L: '${left}' | C: '${center}' | R: '${right}'`);
});

console.log("\n=== Delay Calculation Tests ===");
const testPunctuation = ["hello", "hello,", "hello.", "hello-world", "longworddelay"];
testPunctuation.forEach(word => {
    const delay = calculateWordDelay(word, 300);
    console.log(`[${word.padEnd(20, ' ')}] => ${delay}ms`);
});

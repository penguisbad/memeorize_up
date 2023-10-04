import random from '../pages/random';

export default function getChoices(array, correctIndex) {
  let r = random(0, 4);
  let choices = [];
  for (let i = 0; i < 4; i++) {
    if (i === r) {
      choices.push(array[correctIndex]);
    } else {
      let randomItem;
      do {
        randomItem = array[random(0, array.length)];
      } while (
        randomItem === array[correctIndex] ||
        choices.includes(randomItem)
      );

      choices.push(randomItem);
    }
  }
  return choices;
}

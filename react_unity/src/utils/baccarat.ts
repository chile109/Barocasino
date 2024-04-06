
// 函數：取得一個隨機數字（1 到 13 之間）
export function getRandomNumber(): number {
  const randomNumber: number = Math.floor(Math.random() * 13) + 1;
  // console.log(`結果：${randomNumber}，這是 getRandomNumber() 函數`);
  return randomNumber;
}

// 函數：取得一個隨機花色
export function getRandomSuit(): string {
  const suits: string[] = ["Spade", "Heart", "Diamond", "Club"];
  const randomIndex: number = Math.floor(Math.random() * suits.length);
  const result: string = suits[randomIndex];
  // console.log(`結果：${result}，這是 getRandomSuit() 函數`);
  return result;
}

export interface Card {
  Suit: string;
  Number: number;
  IsSpecialCard: boolean;
  SpecialCardData: any;
}

// 函數：取得一個隨機花色、數字的撲克牌
export function getRandomCard(): Card {
  return {
    Suit: getRandomSuit(),
    Number: getRandomNumber(),
    IsSpecialCard: false,
    SpecialCardData: null,
  };
  // console.log(
  //   `花色：${card.suit}，數字${card.Number}，這是 getRandomCard() 函數`,
  // );
}

// 函數：根據牌的數字返回對應的點數
export function getCardValue(card: Card): number {
  if (card.Number >= 10) {
    return 0; // 10、J、Q、K 點數為 0
  } else {
    return card.Number; // 其他牌點數等於牌面數字
  }
}

// 函數：根據百家規則，計算牌面點數
function getPoints(cards: Card[]): number {
  return cards.reduce((acc: number, card: Card) => acc + getCardValue(card), 0) % 9;
}

export function gameFn(): GameResult {
  const bankerCards: Card[] = [getRandomCard(), getRandomCard()];
  const playerCards: Card[] = [getRandomCard(), getRandomCard()];
  let bankerPoints: number = getPoints(bankerCards);
  let playerPoints: number = getPoints(playerCards);

  let result: string;
  if (bankerPoints > playerPoints) {
    result = "Banker";
  } else if (bankerPoints < playerPoints) {
    result = "Player";
  } else {
    result = "Tie";
  }

  return {result,bankerCards,bankerPoints,playerCards,playerPoints};
}

export interface GameResult {
  result: string;
  bankerCards: Card[]; 
  bankerPoints: number;
  playerCards: Card[]; 
  playerPoints: number;
}

export function generateBaccaratResult(target: string): GameResult {
  let currentResult: GameResult;
  let finalResult: GameResult | undefined;

  do {
    currentResult = gameFn();
    if (currentResult.result === target) {
      finalResult = {
        result: currentResult.result,
        bankerCards: currentResult.bankerCards,
        bankerPoints: currentResult.bankerPoints,
        playerCards: currentResult.playerCards,
        playerPoints: currentResult.bankerPoints,
      };
    }
  } while (!finalResult);

  return finalResult;
}


import { FoodDbEntry } from "./types";

// 1인분(표준 1회 제공량) 기준 대략적인 칼로리·탄단지 추정치 (g)
export const FOOD_DB: Record<string, FoodDbEntry> = {
  후라이드치킨: { calories: 800, carbs: 40, protein: 60, fat: 45, emoji: "🍗", aliases: ["후라이드", "프라이드치킨", "치킨"] },
  양념치킨: { calories: 850, carbs: 55, protein: 55, fat: 45, emoji: "🍗", aliases: ["양념 치킨"] },
  피자: { calories: 285, carbs: 36, protein: 12, fat: 10, emoji: "🍕", aliases: ["피자 한조각", "피자한조각"] },
  라면: { calories: 500, carbs: 78, protein: 10, fat: 16, emoji: "🍜", aliases: ["라멘", "봉지라면"] },
  떡볶이: { calories: 480, carbs: 90, protein: 9, fat: 8, emoji: "🌶️", aliases: ["떡볶기"] },
  김밥: { calories: 400, carbs: 60, protein: 12, fat: 10, emoji: "🍙", aliases: ["김밥 한줄"] },
  햄버거: { calories: 550, carbs: 45, protein: 25, fat: 30, emoji: "🍔", aliases: ["버거", "빅맥"] },
  감자튀김: { calories: 365, carbs: 48, protein: 4, fat: 17, emoji: "🍟", aliases: ["프렌치프라이", "감튀"] },
  아이스크림: { calories: 250, carbs: 30, protein: 4, fat: 12, emoji: "🍦", aliases: ["젤라또", "아아스크림"] },
  초콜릿: { calories: 220, carbs: 24, protein: 3, fat: 13, emoji: "🍫", aliases: ["초콜렛"] },
  케이크: { calories: 350, carbs: 45, protein: 5, fat: 16, emoji: "🍰", aliases: ["조각케이크"] },
  도넛: { calories: 300, carbs: 35, protein: 4, fat: 16, emoji: "🍩", aliases: ["도너츠"] },
  커피라떼: { calories: 190, carbs: 18, protein: 8, fat: 7, emoji: "☕", aliases: ["라떼", "카페라떼"] },
  아메리카노: { calories: 15, carbs: 3, protein: 0, fat: 0, emoji: "☕", aliases: [] },
  탄산음료: { calories: 150, carbs: 39, protein: 0, fat: 0, emoji: "🥤", aliases: ["콜라", "사이다"] },
  맥주: { calories: 210, carbs: 13, protein: 2, fat: 0, emoji: "🍺", aliases: ["생맥주"] },
  소주: { calories: 400, carbs: 0, protein: 0, fat: 0, emoji: "🍶", aliases: [] },
  삼겹살: { calories: 650, carbs: 0, protein: 36, fat: 55, emoji: "🥓", aliases: ["삼겹살 1인분"] },
  곱창: { calories: 600, carbs: 5, protein: 30, fat: 50, emoji: "🍢", aliases: [] },
  족발: { calories: 800, carbs: 10, protein: 60, fat: 55, emoji: "🍖", aliases: [] },
  보쌈: { calories: 700, carbs: 15, protein: 50, fat: 45, emoji: "🍖", aliases: [] },
  초밥: { calories: 400, carbs: 65, protein: 20, fat: 5, emoji: "🍣", aliases: ["스시"] },
  탕수육: { calories: 900, carbs: 80, protein: 30, fat: 50, emoji: "🥡", aliases: [] },
  짜장면: { calories: 700, carbs: 100, protein: 18, fat: 20, emoji: "🍜", aliases: ["자장면"] },
  짬뽕: { calories: 650, carbs: 80, protein: 25, fat: 20, emoji: "🍜", aliases: [] },
  마라탕: { calories: 700, carbs: 50, protein: 30, fat: 40, emoji: "🌶️", aliases: [] },
  마라샹궈: { calories: 750, carbs: 40, protein: 35, fat: 45, emoji: "🌶️", aliases: [] },
  샐러드: { calories: 250, carbs: 20, protein: 10, fat: 14, emoji: "🥗", aliases: [] },
  버블티: { calories: 350, carbs: 70, protein: 3, fat: 5, emoji: "🧋", aliases: ["밀크티"] },
  와플: { calories: 400, carbs: 55, protein: 6, fat: 17, emoji: "🧇", aliases: [] },
  붕어빵: { calories: 220, carbs: 45, protein: 5, fat: 2, emoji: "🐟", aliases: [] },
  호떡: { calories: 220, carbs: 40, protein: 3, fat: 6, emoji: "🥞", aliases: [] },
  순대: { calories: 450, carbs: 40, protein: 20, fat: 22, emoji: "🌭", aliases: [] },
  닭발: { calories: 500, carbs: 20, protein: 35, fat: 30, emoji: "🌶️", aliases: [] },
  회: { calories: 300, carbs: 5, protein: 45, fat: 10, emoji: "🐟", aliases: ["모둠회"] },
  스테이크: { calories: 500, carbs: 0, protein: 45, fat: 35, emoji: "🥩", aliases: [] },
  파스타: { calories: 650, carbs: 80, protein: 18, fat: 25, emoji: "🍝", aliases: ["스파게티"] },
  쌀국수: { calories: 450, carbs: 65, protein: 20, fat: 10, emoji: "🍜", aliases: ["포" ] },
  우동: { calories: 500, carbs: 80, protein: 15, fat: 12, emoji: "🍜", aliases: [] },
  갈비탕: { calories: 500, carbs: 20, protein: 35, fat: 30, emoji: "🍲", aliases: [] },
  삼각김밥: { calories: 180, carbs: 30, protein: 5, fat: 4, emoji: "🍙", aliases: [] },
  빵: { calories: 280, carbs: 45, protein: 6, fat: 9, emoji: "🍞", aliases: ["단팥빵", "크루아상"] },
  과자: { calories: 500, carbs: 60, protein: 5, fat: 25, emoji: "🍪", aliases: ["스낵"] },
  치즈스틱: { calories: 300, carbs: 20, protein: 12, fat: 20, emoji: "🧀", aliases: [] },
  핫도그: { calories: 350, carbs: 35, protein: 10, fat: 18, emoji: "🌭", aliases: [] },
  계란빵: { calories: 200, carbs: 25, protein: 8, fat: 7, emoji: "🥚", aliases: [] },
  케밥: { calories: 600, carbs: 55, protein: 30, fat: 28, emoji: "🌯", aliases: [] },
  타코: { calories: 450, carbs: 40, protein: 20, fat: 22, emoji: "🌮", aliases: [] },
  스무디: { calories: 350, carbs: 60, protein: 5, fat: 8, emoji: "🥤", aliases: ["쉐이크", "밀크쉐이크"] },
  돈까스: { calories: 700, carbs: 55, protein: 30, fat: 40, emoji: "🍱", aliases: ["돈가스"] },
};

export type FoodCategory = {
  name: string;
  keywords: string[];
  emoji: string;
} & import("./types").NutritionInfo;

// 정확히 매칭되지 않을 때 쓰는 카테고리 단위 평균 추정치
export const FOOD_CATEGORIES: FoodCategory[] = [
  { name: "치킨류", keywords: ["치킨", "닭강정", "닭튀김"], calories: 800, carbs: 45, protein: 55, fat: 45, emoji: "🍗" },
  { name: "피자류", keywords: ["피자"], calories: 285, carbs: 36, protein: 12, fat: 10, emoji: "🍕" },
  { name: "면요리", keywords: ["면", "국수", "라멘", "누들"], calories: 550, carbs: 75, protein: 18, fat: 15, emoji: "🍜" },
  { name: "튀김/까스류", keywords: ["튀김", "까스", "가스", "프라이"], calories: 550, carbs: 45, protein: 20, fat: 30, emoji: "🍤" },
  { name: "디저트/베이커리", keywords: ["빵", "디저트", "케익", "쿠키", "타르트", "마카롱", "빙수"], calories: 320, carbs: 45, protein: 5, fat: 14, emoji: "🍰" },
  { name: "고기구이류", keywords: ["고기", "구이", "갈비", "불고기", "정육"], calories: 600, carbs: 5, protein: 40, fat: 45, emoji: "🥩" },
  { name: "음료류", keywords: ["음료", "주스", "에이드", "라떼", "커피", "티"], calories: 250, carbs: 40, protein: 3, fat: 6, emoji: "🥤" },
  { name: "주류", keywords: ["술", "맥주", "소주", "와인", "하이볼", "막걸리"], calories: 300, carbs: 10, protein: 1, fat: 0, emoji: "🍻" },
  { name: "분식류", keywords: ["분식", "김밥", "떡볶", "순대", "오뎅", "어묵"], calories: 450, carbs: 70, protein: 12, fat: 12, emoji: "🍢" },
  { name: "야식/한상차림", keywords: ["족발", "보쌈", "곱창", "야식"], calories: 750, carbs: 15, protein: 50, fat: 50, emoji: "🍖" },
];

// 어떤 카테고리에도 걸리지 않을 때 최후 평균값 (일반적인 한 끼/간식 기준)
export const FALLBACK_NUTRITION = {
  calories: 500,
  carbs: 50,
  protein: 18,
  fat: 22,
  emoji: "🍽️",
};

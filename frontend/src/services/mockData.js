/**
 * 목(Mock) 데이터
 * AI 응답을 시뮬레이션하기 위한 더미 데이터
 */

// 이미지 분석 목 응답 (재료 인식)
export const mockIngredients = {
  success: true,
  ingredients: [
    {
      name: '계란',
      quantity: '10개',
      freshness: 'fresh',
      confidence: 0.95,
    },
    {
      name: '우유',
      quantity: '1L',
      freshness: 'fresh',
      confidence: 0.92,
    },
    {
      name: '토마토',
      quantity: '5개',
      freshness: 'fresh',
      confidence: 0.88,
    },
    {
      name: '양파',
      quantity: '3개',
      freshness: 'moderate',
      confidence: 0.85,
    },
    {
      name: '당근',
      quantity: '4개',
      freshness: 'fresh',
      confidence: 0.90,
    },
    {
      name: '치즈',
      quantity: '200g',
      freshness: 'fresh',
      confidence: 0.87,
    },
    {
      name: '베이컨',
      quantity: '150g',
      freshness: 'moderate',
      confidence: 0.82,
    },
  ],
  image_id: 'mock-image-123',
};

// 레시피 생성 목 응답
export const mockRecipes = {
  success: true,
  recipes: [
    {
      title: '토마토 치즈 오믈렛',
      description: '신선한 토마토와 치즈가 들어간 폭신한 오믈렛',
      ingredients: [
        { name: '계란', quantity: '3개', available: true },
        { name: '토마토', quantity: '2개', available: true },
        { name: '치즈', quantity: '50g', available: true },
        { name: '우유', quantity: '2큰술', available: true },
        { name: '소금', quantity: '약간', available: false },
        { name: '후추', quantity: '약간', available: false },
      ],
      instructions: [
        '계란을 볼에 깨서 우유와 함께 잘 풀어줍니다.',
        '토마토는 잘게 다지고, 치즈는 채 썰어 준비합니다.',
        '팬에 기름을 두르고 중불로 달굽니다.',
        '계란물을 부어 가장자리가 익으면 토마토와 치즈를 올립니다.',
        '반으로 접어 약불에서 1-2분 더 익힌 후 완성합니다.',
      ],
      cooking_time: 15,
      difficulty: 'easy',
      calories: 320,
    },
    {
      title: '베이컨 야채 볶음밥',
      description: '고소한 베이컨과 신선한 야채가 어우러진 볶음밥',
      ingredients: [
        { name: '밥', quantity: '2공기', available: false },
        { name: '베이컨', quantity: '100g', available: true },
        { name: '계란', quantity: '2개', available: true },
        { name: '양파', quantity: '1개', available: true },
        { name: '당근', quantity: '1개', available: true },
        { name: '간장', quantity: '2큰술', available: false },
        { name: '참기름', quantity: '1작은술', available: false },
      ],
      instructions: [
        '베이컨은 1cm 크기로 썰고, 양파와 당근은 잘게 다집니다.',
        '팬에 베이컨을 먼저 볶아 기름을 내줍니다.',
        '양파와 당근을 넣어 함께 볶습니다.',
        '밥을 넣고 간장으로 간을 맞추며 볶습니다.',
        '계란을 풀어 넣고 섞은 후 참기름을 두르면 완성입니다.',
      ],
      cooking_time: 20,
      difficulty: 'easy',
      calories: 480,
    },
    {
      title: '크림 야채 스프',
      description: '부드럽고 영양가 있는 크림 야채 스프',
      ingredients: [
        { name: '우유', quantity: '500ml', available: true },
        { name: '당근', quantity: '2개', available: true },
        { name: '양파', quantity: '1개', available: true },
        { name: '감자', quantity: '2개', available: false },
        { name: '버터', quantity: '2큰술', available: false },
        { name: '밀가루', quantity: '2큰술', available: false },
        { name: '치즈', quantity: '50g', available: true },
      ],
      instructions: [
        '당근, 양파, 감자를 깍둑썰기 합니다.',
        '냄비에 버터를 녹이고 밀가루를 넣어 루를 만듭니다.',
        '우유를 조금씩 넣으며 젓다가 야채를 추가합니다.',
        '중불에서 야채가 익을 때까지 끓입니다.',
        '치즈를 넣고 녹인 후 믹서기로 곱게 갈아 완성합니다.',
      ],
      cooking_time: 30,
      difficulty: 'medium',
      calories: 280,
    },
  ],
};

// 지연 시뮬레이션 (실제 API 호출처럼 보이게)
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

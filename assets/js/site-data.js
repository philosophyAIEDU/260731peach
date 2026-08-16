/*
 * 사이트 기본 정보 · 상품 · 갤러리 설정 파일
 * ------------------------------------------------------------
 * 가격이나 연락처가 바뀌면 이 파일만 수정하면 됩니다.
 * (HTML 은 건드릴 필요 없습니다.)
 */

const SITE = {
  farmName: '덕분에 농원',
  brand: '햇사레 감곡 복숭아',
  catchphrase: '싱그러운 여름의 선물',
  // 주문 문의 전화번호 (하이픈 포함해서 적어주세요)
  phone: '010-5699-7366',
  // 계좌번호는 사이트에 올리지 않습니다.
  // 주문 문자를 받으신 뒤 답장으로 개별 안내해주세요.
  // 수확/판매 기간 안내
  season: '7월 중순 ~ 8월 말 (품종에 따라 변동)',
};

/* 상자 규격 안내 */
const BOX_INFO = {
  netWeight: '4kg',
  packedWeight: '4.7 ~ 4.9kg',
  boxWeight: '약 0.6kg',
};

/*
 * 가격표 묶음
 *  가격표를 두 덩어리로 나눠 보여줍니다.
 *  id    : PRODUCTS 의 group 과 연결되는 식별자
 *  title : 묶음 제목 (빈 문자열이면 제목 없이 바로 표시)
 *  badge : 제목 옆 작은 표시 (없으면 '')
 *  unit  : 카드 아래에 붙는 한 줄 설명
 */
const PRODUCT_GROUPS = [
  {
    id: 'basic',
    title: '',
    badge: '',
    unit: '한 상자 (실중량 4kg)',
  },
  {
    id: 'hard',
    title: '딱딱한 복숭아',
    badge: '7월 31일까지',
    // 딱딱한 복숭아의 상자 무게는 확인되지 않아 적지 않았습니다.
    // 4kg 으로 같다면 위 basic 처럼 '한 상자 (실중량 4kg)' 으로 바꿔주세요.
    unit: '한 상자',

    // 이 날짜까지만 주문받습니다. 다음 날부터는 가격표에 '마감되었습니다' 가
    // 붙고, 주문 수량 선택에서 빠져서 손님이 담을 수 없게 됩니다.
    // 내년에 다시 받으시려면 연도만 바꿔주세요. (예: '2027-07-31')
    closesAfter: '2026-07-31',
    closedBadge: '마감되었습니다',
    closedNote: '딱딱한 복숭아는 7월 31일자로 올해 주문이 마감되었습니다. 내년에 다시 찾아뵐게요!',
  },
];

/*
 * 가격표
 *  id      : 내부 식별자
 *  group   : 위 PRODUCT_GROUPS 의 id
 *  size    : 사이즈 이름 (1호 · 2호 ...). 없으면 안 붙습니다.
 *  count   : 한 상자에 들어가는 개수
 *  price   : 상자당 가격(원)
 *  badge   : 뱃지 문구 (없으면 null)
 *  desc    : 설명 문구
 */
const PRODUCTS = [
  {
    id: 'gift',
    group: 'basic',
    size: '1호',
    count: '10 · 11개',
    price: 35000,
    badge: '선물용',
    desc: '같은 4kg 을 10~11개로 채우니 알이 제일 큽니다. 선물용으로 가장 많이 나가요.',
  },
  {
    id: 'large',
    group: 'basic',
    size: '2호',
    count: '12 · 13개',
    price: 30000,
    badge: null,
    desc: '크기와 가격의 균형이 좋아요. 집에서 드시기에도, 선물하기에도 무난합니다.',
  },
  {
    id: 'medium',
    group: 'basic',
    size: '3호',
    count: '14 · 15개',
    price: 25000,
    badge: null,
    desc: '적당한 크기로 넉넉하게 드실 수 있어요. 가족용으로 인기가 많습니다.',
  },
  {
    id: 'value',
    group: 'basic',
    size: '4호',
    count: '17개 또는 못난이',
    price: 20000,
    badge: '실속형',
    desc: '작은 사이즈로 채워 가격이 저렴합니다. 맛은 그대로! 잼·주스용으로도 좋아요.',
  },

  /* 딱딱한 복숭아 (7월 마감) */
  {
    id: 'hard-large',
    group: 'hard',
    count: '11 · 12 · 13개',
    price: 35000,
    badge: null,
    desc: '아삭한 식감을 좋아하시는 분들께 나가는 복숭아입니다. 알이 굵은 구성이에요.',
  },
  {
    id: 'hard-medium',
    group: 'hard',
    count: '14 · 15 · 16개',
    price: 30000,
    badge: null,
    desc: '같은 딱딱한 복숭아를 조금 작은 알로 채운 구성입니다.',
  },
];

/*
 * 판매 일시중단
 *  주문을 잠시 받지 않을 때 켜두는 스위치입니다.
 *  active 를 true 로 두면 주문 계산기·주문서 칸이 전부 숨겨지고
 *  대신 아래 안내문이 뜹니다. 다시 주문을 받으실 때는
 *  active 를 false 로 바꾸기만 하면 원래대로 돌아옵니다.
 */
const SALE_PAUSE = {
  active: false,
  title: '주문이 잠시 중단되었습니다',
  // 줄바꿈은 그대로 문단이 나뉘어 표시됩니다.
  message:
    '늦복숭아가 일주일 후에 나오는 관계로 주문은 잠시 중단됩니다.\n' +
    '늦복숭아가 나온 후에 다시 주문이 재개됩니다.',
};

/*
 * 주문 전 안내 (주문하기 화면 맨 위에 표시됩니다)
 *  문구를 고치거나, 줄을 추가·삭제하시면 그대로 반영됩니다.
 */
const ORDER_NOTICES = [
  {
    icon: '📩',
    title: '주문 문자를 보내야 주문이 됩니다',
    text: '아래에서 수량과 정보를 채운 뒤, 마지막에 꼭 "주문 문자 보내기" 버튼을 눌러 문자를 전송해주세요. 전송하지 않으면 주문이 접수되지 않습니다.',
  },
  {
    icon: '📦',
    title: '수량은 변동될 수 있습니다',
    text: '입금 전에 꼭 연락주세요. 남은 수량을 확인해드린 뒤에 넣어주시면 됩니다.',
  },
  {
    icon: '🌤️',
    title: '보내드리는 날짜가 조금씩 달라집니다',
    text: '복숭아는 익는 대로 따기 때문에 수확하는 날이 유동적입니다. 그래서 배달 날짜도 날씨와 익는 정도에 따라 앞뒤로 움직일 수 있어요. 발송하는 날 미리 연락드리겠습니다.',
  },
];

/* 택배비 */
const SHIPPING = {
  one: 4000, // 한 상자
  two: 5000, // 두 상자 묶음
  note: '세 상자 이상은 두 상자씩 묶어서 계산됩니다. (제주·도서산간 추가 비용이 발생할 수 있어요)',
};

/*
 * 크기 비교 사진
 *  '상자 안내' 코너에 실제 사진으로 크기를 보여줍니다.
 *  없으면(파일이 비어 있으면) 그 자리가 자동으로 숨겨집니다.
 */
const SIZE_PHOTO = {
  src: 'assets/images/size-compare.jpg',
  webp: 'assets/images/size-compare.webp',
  caption: '왼쪽부터 10 · 12 · 14 · 17개 컵에 올려 크기를 비교했어요',
};

/*
 * 사진 갤러리
 *  사진을 더 넣고 싶으시면 assets/images/ 에 파일을 올린 뒤
 *  아래 목록에 { src: '경로', caption: '설명' } 한 줄을 추가하면 됩니다.
 *  webp 는 용량을 줄인 사본으로, 없으면 그 줄을 빼셔도 됩니다.
 */
const GALLERY = [
  {
    src: 'assets/images/gallery-1.jpg',
    webp: 'assets/images/gallery-1.webp',
    caption: '한 상자에 가지런히 담은 복숭아',
  },
  {
    src: 'assets/images/gallery-2.jpg',
    webp: 'assets/images/gallery-2.webp',
    caption: '노랗게 잘 익은 복숭아',
  },
  {
    src: 'assets/images/gallery-3.jpg',
    webp: 'assets/images/gallery-3.webp',
    caption: '포장까지 마친 한 상자',
  },
  {
    src: 'assets/images/gallery-4.jpg',
    webp: 'assets/images/gallery-4.webp',
    caption: '햇사레 감곡 정품 상자',
  },
  {
    src: 'assets/images/gallery-5.jpg',
    webp: 'assets/images/gallery-5.webp',
    caption: '발송 준비를 마친 상자들',
  },
  {
    src: 'assets/images/gallery-6.jpg',
    webp: 'assets/images/gallery-6.webp',
    caption: '상자마다 무게와 개수를 적어드려요',
  },
  {
    src: 'assets/images/box-11-1.jpg',
    webp: 'assets/images/box-11-1.webp',
    caption: '1호 (10 · 11개) 상자',
  },
  {
    src: 'assets/images/box-11-2.jpg',
    webp: 'assets/images/box-11-2.webp',
    caption: '1호 (10 · 11개) 상자',
  },
  {
    src: 'assets/images/box-12-1.jpg',
    webp: 'assets/images/box-12-1.webp',
    caption: '2호 (12 · 13개) 상자',
  },
  {
    src: 'assets/images/box-12-2.jpg',
    webp: 'assets/images/box-12-2.webp',
    caption: '2호 (12 · 13개) 상자',
  },
];

/*
 * 농사 이야기 (사진 갤러리 아래에 표시됩니다)
 *  약을 적게 치고 제초제를 쓰지 않는다는 점과,
 *  그래서 겉에 흠이 있을 수 있다는 점을 함께 알려드립니다.
 */
const FARMING = {
  title: '이렇게 키웠습니다',
  sub: '조금 덜 예뻐도, 조금 더 안심하고 드실 수 있게 키웁니다.',
  points: [
    {
      icon: '🌱',
      title: '저농약',
      desc: '일반 농가에서 치는 약의 절반만 쳤습니다.',
    },
    {
      icon: '🌿',
      title: '무제초제',
      desc: '제초제는 한 번도 쓰지 않습니다.',
    },
    {
      icon: '🌾',
      title: '풀밭에서 자란 나무',
      desc: '풀을 그대로 두고, 그 사이에서 나무를 키웁니다.',
    },
  ],
  // 사장님 말씀 그대로 전해드리는 문구입니다.
  message:
    '일반 농부들보다 약을 절반만 쳤으니, 혹여 드시다가 살짝 흠이 있어도 ' +
    '너그러이 이해해 주시면 감사하겠습니다 ^^',
};

/* 농원 자랑거리 */
const FEATURES = [
  {
    icon: '🍑',
    title: '신선한 복숭아',
    desc: '직접 재배하여 당일 수확한 싱싱한 복숭아만 보내드립니다.',
  },
  {
    icon: '💝',
    title: '정성 가득 포장',
    desc: '하나하나 정성껏 선별하여 무르지 않도록 안전하게 포장해드립니다.',
  },
  {
    icon: '🚚',
    title: '수확 당일 발송',
    desc: '오전에 딴 복숭아를 그날 바로 보내드려 가장 좋은 상태로 받아보실 수 있어요.',
  },
];

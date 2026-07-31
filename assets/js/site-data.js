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
  // 계좌 안내 (필요 없으면 빈 문자열 '' 로 두면 화면에 표시되지 않습니다)
  bankAccount: '',
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
 * 가격표
 *  id      : 내부 식별자
 *  count   : 한 상자에 들어가는 개수
 *  price   : 상자당 가격(원)
 *  badge   : 뱃지 문구 (없으면 null)
 *  desc    : 설명 문구
 */
const PRODUCTS = [
  {
    id: 'gift',
    count: '10 · 11개',
    price: 35000,
    badge: '선물용',
    desc: '같은 4kg 을 10~11개로 채우니 알이 제일 큽니다. 선물용으로 가장 많이 나가요.',
  },
  {
    id: 'large',
    count: '12 · 13개',
    price: 30000,
    badge: null,
    desc: '크기와 가격의 균형이 좋아요. 집에서 드시기에도, 선물하기에도 무난합니다.',
  },
  {
    id: 'medium',
    count: '14 · 15개',
    price: 25000,
    badge: null,
    desc: '적당한 크기로 넉넉하게 드실 수 있어요. 가족용으로 인기가 많습니다.',
  },
  {
    id: 'value',
    count: '17개 또는 못난이',
    price: 20000,
    badge: '실속형',
    desc: '작은 사이즈로 채워 가격이 저렴합니다. 맛은 그대로! 잼·주스용으로도 좋아요.',
  },
];

/* 택배비 */
const SHIPPING = {
  one: 4000, // 한 상자
  two: 5000, // 두 상자 묶음
  note: '세 상자 이상은 두 상자씩 묶어서 계산됩니다. (제주·도서산간 추가 비용이 발생할 수 있어요)',
};

/*
 * 사진 갤러리
 *  assets/images/ 폴더에 사진을 넣고 아래 목록에 파일명을 적어주세요.
 *  사진 파일이 아직 없으면 자동으로 안내용 이미지가 대신 표시됩니다.
 */
const GALLERY = [
  { src: 'assets/images/peach-01.jpg', caption: '당일 수확한 복숭아' },
  { src: 'assets/images/peach-02.jpg', caption: '햇사레 감곡 복숭아 상자' },
  { src: 'assets/images/peach-03.jpg', caption: '한 상자 실중량 4kg' },
  { src: 'assets/images/peach-04.jpg', caption: '10 · 11개 선물용 구성' },
  { src: 'assets/images/peach-05.jpg', caption: '하나하나 손으로 선별' },
  { src: 'assets/images/peach-06.jpg', caption: '충주 감곡 복숭아 밭' },
  { src: 'assets/images/peach-07.jpg', caption: '완숙 직전에 수확합니다' },
  { src: 'assets/images/peach-08.jpg', caption: '안전하게 포장해 발송' },
];

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

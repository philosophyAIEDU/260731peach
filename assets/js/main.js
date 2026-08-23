/*
 * 덕분에 농원 · 복숭아 판매 사이트
 * 서버나 DB 없이 브라우저에서만 동작합니다.
 * 입력한 주문 정보는 어디에도 전송되지 않고 화면에서만 쓰입니다.
 */
(function () {
  'use strict';

  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const won = (n) => n.toLocaleString('ko-KR') + '원';

  // 앞 글자의 받침 유무에 따라 조사를 골라줍니다. (주소를 / 이름을)
  function josa(word, withBatchim, withoutBatchim) {
    const code = word.charCodeAt(word.length - 1);
    if (code < 0xac00 || code > 0xd7a3) return withoutBatchim; // 한글이 아니면 기본값
    return (code - 0xac00) % 28 ? withBatchim : withoutBatchim;
  }

  /* ══════════ 농원 자랑거리 ══════════ */
  function renderFeatures() {
    $('#featureGrid').innerHTML = FEATURES.map((f) => `
      <article class="feature reveal">
        <div class="feature__icon">${f.icon}</div>
        <h3 class="feature__title">${f.title}</h3>
        <p class="feature__desc">${f.desc}</p>
      </article>`).join('');
  }

  /* ══════════ 사진 갤러리 ══════════ */
  // 실제 사진이 준비되기 전에도 화면이 비어 보이지 않도록,
  // 파일을 못 찾으면 안내용 자리 카드로 바꿔줍니다.
  function renderGallery() {
    const grid = $('#galleryGrid');
    grid.innerHTML = GALLERY.map((g, i) => `
      <button class="gcard reveal" type="button" data-index="${i}" aria-label="${g.caption} 크게 보기">
        <picture>
          ${g.webp ? `<source srcset="${g.webp}" type="image/webp">` : ''}
          <img src="${g.src}" alt="${g.caption}" loading="lazy" decoding="async">
        </picture>
        <span class="gcard__cap">${g.caption}</span>
      </button>`).join('');

    grid.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => {
        const card = img.closest('.gcard');
        const file = img.getAttribute('src').split('/').pop();
        card.classList.add('gcard--empty');
        card.disabled = true;
        card.innerHTML =
          `<div><div class="gcard__ph">🍑</div>${img.alt}
           <code>${file}</code></div>`;
      });
    });

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.gcard');
      if (card && !card.disabled) openLightbox(Number(card.dataset.index));
    });
  }

  /* ══════════ 사진 크게 보기 ══════════ */
  let lbIndex = 0;

  function usableSlides() {
    // 실제로 로드된 사진만 넘겨봅니다.
    return $$('#galleryGrid .gcard:not(.gcard--empty)').map((c) => Number(c.dataset.index));
  }

  function showSlide(idx) {
    const g = GALLERY[idx];
    lbIndex = idx;
    // 썸네일이 이미 받아둔 webp 를 그대로 재사용합니다.
    if (g.webp) $('#lbSource').srcset = g.webp;
    else $('#lbSource').removeAttribute('srcset');
    $('#lbImg').src = g.src;
    $('#lbImg').alt = g.caption;
    $('#lbCaption').textContent = g.caption;
  }

  function openLightbox(idx) {
    showSlide(idx);
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    $('#lightbox').hidden = true;
    document.body.style.overflow = '';
  }

  function step(dir) {
    const list = usableSlides();
    if (!list.length) return;
    const at = list.indexOf(lbIndex);
    showSlide(list[(at + dir + list.length) % list.length]);
  }

  function bindLightbox() {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => step(-1));
    $('#lbNext').addEventListener('click', () => step(1));
    $('#lightbox').addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if ($('#lightbox').hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ══════════ 농사 이야기 ══════════ */
  function renderFarming() {
    const box = $('#farmingBox');
    if (!box || typeof FARMING === 'undefined') return;

    box.innerHTML = `
      <h2 class="h2">${FARMING.title}</h2>
      ${FARMING.sub ? `<p class="sub">${FARMING.sub}</p>` : ''}

      <div class="farm__grid">
        ${(FARMING.points || []).map((p) => `
          <article class="farm__card reveal">
            <div class="farm__icon">${p.icon || '🌱'}</div>
            <h3 class="farm__title">${p.title}</h3>
            <p class="farm__desc">${p.desc}</p>
          </article>`).join('')}
      </div>

      ${FARMING.message ? `
        <blockquote class="farm__note reveal">
          <p>${FARMING.message}</p>
        </blockquote>` : ''}`;
  }

  /* ══════════ 크기 비교 (개수가 적을수록 알이 큼) ══════════ */
  function renderSizeBar() {
    const sizes = [
      { emoji: 62, size: '1호', count: '10 · 11개', label: '제일 큰 알' },
      { emoji: 52, size: '2호', count: '12 · 13개', label: '큰 알' },
      { emoji: 44, size: '3호', count: '14 · 15개', label: '중간 알' },
      { emoji: 36, size: '4호', count: '17개',      label: '작은 알' },
    ];
    $('#sizeBar').innerHTML = sizes.map((s) => `
      <div class="szitem reveal">
        <div class="szitem__peach" style="font-size:${s.emoji}px">🍑</div>
        <div class="szitem__size">${s.size}</div>
        <div class="szitem__count">${s.count}</div>
        <div class="szitem__label">${s.label}</div>
      </div>`).join('');
  }

  /* ══════════ 실제 크기 비교 사진 ══════════ */
  // 사진 파일이 없거나 못 불러오면 자리를 그냥 숨깁니다.
  function renderSizePhoto() {
    const box = $('#sizePhoto');
    if (!box || typeof SIZE_PHOTO === 'undefined' || !SIZE_PHOTO.src) {
      if (box) box.hidden = true;
      return;
    }

    box.innerHTML = `
      <picture>
        ${SIZE_PHOTO.webp ? `<source srcset="${SIZE_PHOTO.webp}" type="image/webp">` : ''}
        <img src="${SIZE_PHOTO.src}" alt="${SIZE_PHOTO.caption || '크기 비교 사진'}" loading="lazy" decoding="async">
      </picture>
      ${SIZE_PHOTO.caption ? `<figcaption>${SIZE_PHOTO.caption}</figcaption>` : ''}`;

    box.hidden = false;
    box.querySelector('img').addEventListener('error', () => { box.hidden = true; });
  }

  /* ══════════ 가격표 ══════════ */
  const groupOf = (id) => PRODUCT_GROUPS.find((g) => g.id === id) || PRODUCT_GROUPS[0];
  const itemsOf = (gid) => PRODUCTS.filter((p) => p.group === gid);

  // 오늘 날짜를 '한국 시간' 기준 YYYY-MM-DD 로 돌려줍니다.
  // 손님 기기의 시계를 그대로 쓰면, 한국보다 느린 시간대(예: 미국)에서
  // 접속한 손님에게는 마감이 하루 늦게 걸립니다.
  function todayInKorea() {
    try {
      // en-CA 는 YYYY-MM-DD 형식이라 문자열끼리 바로 비교할 수 있습니다.
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    } catch (err) {
      // 시간대 변환을 지원하지 않는 아주 옛날 브라우저 대비
      const t = new Date(Date.now() + 9 * 3600 * 1000);
      return t.toISOString().slice(0, 10);
    }
  }

  // closesAfter 날짜가 지났는지 봅니다. 그 날짜 당일까지는 주문할 수 있습니다.
  function isClosed(group) {
    if (!group.closesAfter) return false;
    return todayInKorea() > group.closesAfter;
  }

  const isOrderable = (p) => !isClosed(groupOf(p.group));

  function renderPrices() {
    $('#priceGrid').innerHTML = PRODUCT_GROUPS.map((g) => {
      const items = itemsOf(g.id);
      if (!items.length) return '';

      const closed = isClosed(g);
      const badge = closed ? (g.closedBadge || '마감') : g.badge;

      const head = g.title
        ? `<h3 class="pgroup__title reveal">${g.title}
             ${badge ? `<span class="pgroup__badge ${closed ? 'pgroup__badge--closed' : ''}">${badge}</span>` : ''}
           </h3>`
        : '';

      const note = closed && g.closedNote
        ? `<p class="pgroup__note reveal">${g.closedNote}</p>`
        : '';

      const cards = items.map((p) => `
        <article class="pcard reveal ${p.badge === '선물용' ? 'pcard--featured' : ''}">
          ${p.badge ? `<span class="pcard__badge">${p.badge}</span>` : ''}
          <div class="pcard__icon">🍑</div>
          ${p.size ? `<p class="pcard__size">${p.size}</p>` : ''}
          <h4 class="pcard__count">${p.count}</h4>
          <p class="pcard__price">${p.price.toLocaleString('ko-KR')}<small>원</small></p>
          <p class="pcard__unit">${g.unit}</p>
          <p class="pcard__desc">${p.desc}</p>
        </article>`).join('');

      return `<div class="pgroup ${closed ? 'pgroup--closed' : ''}">
                ${head}${note}<div class="pgroup__cards">${cards}</div>
              </div>`;
    }).join('');

    $('#ship1').textContent = won(SHIPPING.one);
    $('#ship2').textContent = won(SHIPPING.two);
    $('#shipNote').textContent = SHIPPING.note;
  }

  /* ══════════ 주문 전 안내 ══════════ */
  function renderNotices() {
    const box = $('#orderNotice');
    if (!box) return;

    if (!Array.isArray(ORDER_NOTICES) || !ORDER_NOTICES.length) {
      box.hidden = true;
      return;
    }

    box.innerHTML = `
      <p class="notice__head">🍑 주문 전에 꼭 읽어주세요</p>
      <ul class="notice__list">
        ${ORDER_NOTICES.map((n) => `
          <li class="notice__item">
            <span class="notice__icon" aria-hidden="true">${n.icon || '🍑'}</span>
            <span>
              <b>${n.title}</b>
              <span class="notice__text">${n.text}</span>
            </span>
          </li>`).join('')}
      </ul>`;
  }

  /* ══════════ 주문 계산기 ══════════ */
  const cart = {}; // { 상품id: 수량 }

  function renderQty() {
    $('#qtyList').innerHTML = PRODUCT_GROUPS.map((g) => {
      // 마감된 묶음은 아예 담을 수 없도록 목록에서 뺍니다.
      if (isClosed(g)) return '';

      const items = itemsOf(g.id);
      if (!items.length) return '';

      // 묶음 제목이 있는 것만 소제목을 답니다 (딱딱한 복숭아 등)
      const head = g.title
        ? `<p class="qgroup">${g.title}${g.badge ? ` <span class="qgroup__badge">${g.badge}</span>` : ''}</p>`
        : '';

      return head + items.map((p) => {
        const label = (g.title ? `${g.title} ` : '') + (p.size ? `${p.size} ` : '') + p.count;
        return `
        <div class="qrow" data-id="${p.id}">
          <div class="qrow__info">
            <div class="qrow__name">
              ${p.size ? `<span class="qrow__size">${p.size}</span>` : ''}${p.count}${p.badge ? ` <small>(${p.badge})</small>` : ''}
            </div>
            <div class="qrow__price">${won(p.price)} / 상자</div>
          </div>
          <div class="qrow__ctrl">
            <button class="qbtn" type="button" data-act="minus" aria-label="${label} 수량 줄이기">−</button>
            <input class="qnum" type="number" min="0" max="99" value="0"
                   inputmode="numeric" aria-label="${label} 상자 수량">
            <button class="qbtn" type="button" data-act="plus" aria-label="${label} 수량 늘리기">+</button>
          </div>
        </div>`;
      }).join('');
    }).join('');

    PRODUCTS.forEach((p) => { cart[p.id] = 0; });

    $('#qtyList').addEventListener('click', (e) => {
      const btn = e.target.closest('.qbtn');
      if (!btn) return;
      const row = btn.closest('.qrow');
      const input = row.querySelector('.qnum');
      const next = Math.max(0, Math.min(99, Number(input.value) + (btn.dataset.act === 'plus' ? 1 : -1)));
      input.value = next;
      cart[row.dataset.id] = next;
      update();
    });

    $('#qtyList').addEventListener('input', (e) => {
      const input = e.target.closest('.qnum');
      if (!input) return;
      const row = input.closest('.qrow');
      const n = Math.max(0, Math.min(99, Math.floor(Number(input.value) || 0)));
      cart[row.dataset.id] = n;
      update();
    });
  }

  // 두 상자씩 묶으면 5,000원, 남는 한 상자는 4,000원
  function shippingFee(boxes) {
    if (boxes <= 0) return 0;
    return Math.floor(boxes / 2) * SHIPPING.two + (boxes % 2) * SHIPPING.one;
  }

  function orderLines() {
    return PRODUCTS
      .filter((p) => cart[p.id] > 0 && isOrderable(p))
      .map((p) => ({ ...p, qty: cart[p.id], sum: p.price * cart[p.id] }));
  }

  /* ══════════ 합계 · 주문서 미리보기 ══════════ */
  function update() {
    const lines   = orderLines();
    const boxes   = lines.reduce((n, l) => n + l.qty, 0);
    const product = lines.reduce((n, l) => n + l.sum, 0);
    const ship    = shippingFee(boxes);

    $('#sumProduct').textContent  = won(product);
    $('#sumShip').textContent     = won(ship);
    $('#sumTotal').textContent    = won(product + ship);
    $('#sumBoxCount').textContent = boxes ? `(${boxes}상자)` : '';

    $$('.qrow').forEach((r) => r.classList.toggle('is-on', cart[r.dataset.id] > 0));

    $('#preview').textContent = buildMessage(lines, boxes, product, ship);
    updateSmsLink();
  }

  // 받는 분 성함 칸이 필요한지 (주문자와 다를 때만) 판단합니다.
  const isSameName = () => $('#chkSameName').checked;

  function buildMessage(lines, boxes, product, ship) {
    const orderer = $('#fOrderer').value.trim();
    const sameName = isSameName();
    const receiver = sameName ? orderer : $('#fName').value.trim();
    const phone = $('#fPhone').value.trim();
    const addr  = $('#fAddr').value.trim();
    const memo  = $('#fMemo').value.trim();

    // 주문 날짜도 한국 시간 기준으로 적습니다.
    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
    });

    const out = [`[복숭아 주문] ${today}`, ''];

    if (lines.length) {
      // 딱딱한 복숭아처럼 종류가 나뉜 것, 1호~4호 사이즈 이름을 같이 적어
      // 사장님이 헷갈리지 않게 합니다.
      lines.forEach((l) => {
        const g = groupOf(l.group);
        const name = (g.title ? `${g.title} ` : '') + (l.size ? `${l.size} ` : '') + l.count;
        out.push(`· ${name} ${l.qty}상자 — ${won(l.sum)}`);
      });
      out.push('', `상품 ${won(product)} + 택배비 ${won(ship)} = 합계 ${won(product + ship)}`, '');
    } else {
      out.push('· (위에서 수량을 선택해주세요)', '');
    }

    // 받는 분이 주문자와 같으면 한 줄로, 다르면 두 줄로 나눠 적어
    // 사장님이 누구에게 보내야 할지 헷갈리지 않게 합니다.
    if (sameName) {
      out.push(`이름   : ${orderer || '(입력해주세요)'}`);
    } else {
      out.push(`보내는이(주문자): ${orderer || '(입력해주세요)'}`);
      out.push(`받는이         : ${receiver || '(입력해주세요)'}`);
    }
    out.push(`전화   : ${phone || '(입력해주세요)'}`);
    out.push(`주소   : ${addr || '(입력해주세요)'}`);
    if (memo) out.push(`요청사항: ${memo}`);

    return out.join('\n');
  }

  /* ══════════ 빠진 항목 확인 ══════════ */
  // 손님이 수량이나 주소를 빠뜨린 채 문자를 보내면
  // 사장님이 다시 물어봐야 하니, 보내기 전에 먼저 확인합니다.
  function findMissing() {
    const missing = [];

    if (!orderLines().length) {
      missing.push({ label: '수량', el: $('#qtyList') });
    }

    const required = [['#fOrderer', '보내는이(주문자) 성함'], ['#fPhone', '전화번호'], ['#fAddr', '주소']];
    // 받는 분이 주문자와 다르면 받는 분 성함도 따로 채워야 합니다.
    if (!isSameName()) required.push(['#fName', '받는 분 성함']);

    required.forEach(([sel, label]) => {
      const el = $(sel);
      if (!el.value.trim()) missing.push({ label, el, field: el.closest('.field') });
    });

    return missing;
  }

  function checkBeforeSend() {
    $$('.field').forEach((f) => f.classList.remove('field--missing'));

    const missing = findMissing();
    if (!missing.length) return true;

    missing.forEach((m) => m.field && m.field.classList.add('field--missing'));

    const labels = missing.map((m) => m.label).join(', ');
    toast(`${labels}${josa(labels, '을', '를')} 입력해주세요 🍑`);

    const first = missing[0];
    first.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (first.el.focus) setTimeout(() => first.el.focus({ preventScroll: true }), 400);
    return false;
  }

  /* ══════════ 복사 · 문자 · 전화 ══════════ */
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('is-on'), 2000);
  }

  async function copyOrder() {
    if (!checkBeforeSend()) return;

    const text = $('#preview').textContent;
    try {
      await navigator.clipboard.writeText(text);
      toast('복사했어요! 문자에 붙여넣고 꼭 전송해주세요 📩');
    } catch (err) {
      // 구형 브라우저 · http 환경 대비
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      toast(ok ? '복사했어요! 문자에 붙여넣고 꼭 전송해주세요 📩' : '복사가 안 되네요. 내용을 길게 눌러 직접 복사해주세요.');
    }
  }

  // 문자·전화 버튼은 휴대폰에서만 실제로 동작합니다.
  const IS_PHONE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  function updateSmsLink() {
    const num  = SITE.phone.replace(/[^0-9+]/g, '');
    const body = encodeURIComponent($('#preview').textContent);
    // iOS 와 안드로이드의 sms: 구분자가 달라서 기기별로 나눠줍니다.
    const sep  = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    $('#btnSms').href = `sms:${num}${sep}body=${body}`;
    $('#btnTel').href = `tel:${num}`;
  }

  function bindSendButtons() {
    // PC 에서는 sms: / tel: 링크가 대부분 아무 반응이 없어서,
    // 버튼을 감추는 대신 무엇을 하면 되는지 안내합니다.
    if (!IS_PHONE) {
      $('#btnSms').textContent = '📩 주문 문자 보내기 (휴대폰에서)';
      $('#pcHint').hidden = false;
    }

    $('#btnSms').addEventListener('click', (e) => {
      if (!checkBeforeSend()) { e.preventDefault(); return; }
      if (!IS_PHONE) {
        e.preventDefault();
        copyOrder(); // 대신 복사해드립니다 (안내 문구는 copyOrder 안에서 표시)
        return;
      }
      // 문자 앱이 열린 뒤에도 '전송'을 눌러야 한다는 걸 다시 알립니다.
      $('#sentHint').hidden = false;
      toast('문자 앱에서 보내기 버튼까지 꼭 눌러주세요! 📩');
    });

    $('#btnTel').addEventListener('click', (e) => {
      if (!IS_PHONE) {
        e.preventDefault();
        toast(`전화 주문은 ${SITE.phone} 로 걸어주세요 🍑`);
      }
    });
  }

  /* ══════════ 연락처 표시 ══════════ */
  function renderContact() {
    const tel = `tel:${SITE.phone.replace(/[^0-9+]/g, '')}`;
    $('#phoneText').textContent = SITE.phone;
    $('#navCall').textContent = '주문 문의';
    $('#footerPhone').innerHTML = `주문 및 문의 · <a href="${tel}">${SITE.phone}</a>`;
    document.title = `${SITE.farmName} · 맛있는 복숭아`;
  }

  /* ══════════ 판매 일시중단 ══════════ */
  // SALE_PAUSE.active 가 true 면 주문 계산기·주문서를 통째로 숨기고
  // 안내문으로 바꿔치기합니다. 다시 열 때는 site-data.js 에서
  // active 만 false 로 바꾸면 원래 화면이 그대로 돌아옵니다.
  function renderSalePause() {
    const active = typeof SALE_PAUSE !== 'undefined' && SALE_PAUSE.active;
    const box = $('#salePause');
    if (!box) return;

    if (!active) { box.hidden = true; return; }

    const lines = (SALE_PAUSE.message || '').split('\n').filter(Boolean);
    const tel = `tel:${SITE.phone.replace(/[^0-9+]/g, '')}`;

    box.innerHTML = `
      <div class="pause__icon">${SALE_PAUSE.icon || '⏸️'}</div>
      <h3 class="pause__title">${SALE_PAUSE.title || '주문이 잠시 중단되었습니다'}</h3>
      ${lines.map((l) => `<p class="pause__text">${l}</p>`).join('')}
      <p class="pause__contact">궁금하신 점은 언제든 편하게 연락 주세요 · <a href="${tel}">${SITE.phone}</a></p>`;
    box.hidden = false;

    // 주문 계산기·주문서 폼은 통째로 숨기고, 안내만 남깁니다.
    const notice = $('#orderNotice');
    const grid = $('#orderGrid');
    if (notice) notice.hidden = true;
    if (grid) grid.hidden = true;

    // 히어로·모바일 하단 고정 버튼도 지금 주문할 수 없다는 걸 알 수 있게 바꿉니다.
    const heroCta = $('#ctaHero');
    if (heroCta) {
      heroCta.textContent = '주문 안내 보기';
      heroCta.classList.remove('btn--primary');
      heroCta.classList.add('btn--ghost');
    }
    const floatCta = $('.floatcta');
    if (floatCta) {
      floatCta.textContent = '📢 주문 안내 보기';
      floatCta.classList.add('floatcta--paused');
    }
  }

  /* ══════════ 스크롤 등장 효과 ══════════ */
  function bindReveal() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  }

  /* ══════════ 모바일 하단 주문 버튼 ══════════ */
  // 두 곳에서는 숨깁니다.
  //  - 첫 화면: 바로 위에 같은 '주문하기' 버튼이 있어 겹칩니다
  //  - 주문 영역: 주소 입력칸을 가립니다
  function bindFloatCta() {
    const cta = $('.floatcta');
    if (!cta || !('IntersectionObserver' in window)) return;

    const seen = { hero: true, order: false };
    const apply = () => cta.classList.toggle('is-hidden', seen.hero || seen.order);

    const watch = (el, key) => {
      if (!el) return;
      new IntersectionObserver(([en]) => {
        seen[key] = en.isIntersecting;
        apply();
      }, { threshold: 0 }).observe(el);
    };

    watch($('.hero'), 'hero');
    watch($('#order'), 'order');
    apply();
  }

  /* ══════════ 상단 메뉴 그림자 ══════════ */
  function bindNav() {
    const nav = $('#nav');
    const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ 시작 ══════════ */
  function init() {
    renderContact();
    renderFeatures();
    renderGallery();
    renderFarming();
    renderSizeBar();
    renderSizePhoto();
    renderPrices();
    renderNotices();
    renderQty();
    renderSalePause();
    bindLightbox();
    bindNav();
    bindSendButtons();
    bindFloatCta();

    ['#fOrderer', '#fName', '#fPhone', '#fAddr', '#fMemo'].forEach((sel) => {
      $(sel).addEventListener('input', (e) => {
        // 채워 넣기 시작하면 빨간 표시를 지웁니다.
        const field = e.target.closest('.field');
        if (field && e.target.value.trim()) field.classList.remove('field--missing');
        update();
      });
    });

    // 받는 분이 주문자와 같은지에 따라 성함 칸을 보이거나 숨깁니다.
    $('#chkSameName').addEventListener('change', () => {
      $('#fieldReceiver').hidden = isSameName();
      if (!isSameName()) {
        $('#fieldReceiver').classList.remove('field--missing');
        $('#fName').focus();
      }
      update();
    });

    $('#btnCopy').addEventListener('click', copyOrder);

    update();
    bindReveal();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

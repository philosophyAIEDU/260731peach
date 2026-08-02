/*
 * 주문 장부 (사장님용)
 * ------------------------------------------------------------
 * 문자로 받은 주문을 적어두고, 나중에 택배 기사님께 보낼 문자를
 * 한 번에 복사하기 위한 화면입니다.
 *
 * 적은 내용은 이 기기의 브라우저 저장소(localStorage)에만 남습니다.
 * 서버로 보내지 않으므로 손님의 이름·주소가 인터넷에 올라가지 않습니다.
 */
(function () {
  'use strict';

  const $  = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const KEY = 'deokbune-orders-v1';

  let orders = [];      // 저장된 주문들
  let editingId = null; // 수정 중인 주문 id

  /* ══════════ 도우미 ══════════ */

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // 한국 시간 기준 오늘 (YYYY-MM-DD)
  function todayKR() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    } catch (err) {
      return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    }
  }

  // 2026-08-01 → 8월 1일
  function prettyDate(iso) {
    if (!iso) return '';
    const [, m, d] = iso.split('-');
    return `${Number(m)}월 ${Number(d)}일`;
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('is-on'), 2400);
  }

  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      toast(ok ? okMsg : '복사가 안 되네요. 미리보기 내용을 길게 눌러 직접 복사해주세요.');
    }
  }

  /* ══════════ 저장 / 불러오기 ══════════ */

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      orders = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(orders)) orders = [];
    } catch (err) {
      orders = [];
      toast('저장된 장부를 읽지 못했습니다. 새로 시작합니다.');
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(orders));
    } catch (err) {
      // 저장 공간이 꽉 찼거나 시크릿 모드인 경우
      toast('저장에 실패했습니다. 브라우저 시크릿 모드는 아닌지 확인해주세요.');
    }
  }

  /* ══════════ 문자 내용 읽어오기 ══════════ */

  // 손님이 보낸 문자에서 이름·전화·주소·주문내용을 뽑아냅니다.
  // 손님이 문구를 고쳐 보냈을 수도 있어 최대한 너그럽게 찾습니다.
  function parseMessage(text) {
    const out = { orderer: '', name: '', phone: '', address: '', items: '', boxes: '', memo: '' };
    if (!text.trim()) return out;

    const pick = (labels) => {
      for (const label of labels) {
        const re = new RegExp(`${label}\\s*[:：]\\s*(.+)`);
        const m = text.match(re);
        if (m && m[1].trim() && !m[1].includes('입력해주세요')) return m[1].trim();
      }
      return '';
    };

    // '받는이' 라벨을 먼저 찾습니다 (주문자와 받는 분이 다른 주문서 형식).
    out.name    = pick(['받는이', '받는 분', '받는분', '이름', '성함']);
    out.phone   = pick(['전화', '연락처', '전화번호', '핸드폰', '휴대폰']);
    out.address = pick(['주소', '배송지', '받는주소']);
    out.memo    = pick(['요청사항', '메모', '남기실 말씀', '요청']);

    // 주문자(보내는이)를 받는 분과 별도로 읽어옵니다.
    out.orderer = pick(['보내는이\\(주문자\\)', '보내는이', '주문자']);

    // 아래는 손님이 '이름:' 같은 라벨 없이 그냥 적어 보낸 경우를 위한 것입니다.
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const PHONE = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/;

    if (!out.phone) {
      const m = text.match(PHONE);
      if (m) out.phone = m[0];
    }

    // 이름: 전화번호가 적힌 줄에서 번호를 빼고 남은 한글 2~5글자
    if (!out.name && out.phone) {
      const line = lines.find((l) => PHONE.test(l)) || '';
      const rest = line.replace(PHONE, ' ').replace(/[^가-힣\s]/g, ' ').trim();
      const cand = rest.split(/\s+/).find((w) => /^[가-힣]{2,5}$/.test(w));
      // '주문' 처럼 이름이 아닌 낱말은 거릅니다
      if (cand && !/^(주문|배송|연락처|전화|번호|입니다|부탁)/.test(cand)) out.name = cand;
    }

    // 주소: 시·군·구·읍·면·동·로·길 이 들어가고 숫자가 있는 줄 중 가장 긴 것
    if (!out.address) {
      const cands = lines.filter((l) =>
        /(시|도|군|구|읍|면|동|리|로|길|번지|아파트|빌라)/.test(l) &&
        /\d/.test(l) &&
        !PHONE.test(l) &&
        !/^[·•\-*]/.test(l) &&
        !/(합계|택배비|상품|주문)/.test(l));
      if (cands.length) out.address = cands.sort((a, b) => b.length - a.length)[0];
    }

    // '· 10 · 11개 2상자 — 70,000원' 같은 줄들을 모읍니다
    const items = [];
    let boxes = 0;
    text.split('\n').forEach((line) => {
      const t = line.trim();
      if (!/^[·•\-*]/.test(t)) return;
      if (t.includes('입력해주세요') || t.includes('선택해주세요')) return;

      const body = t.replace(/^[·•\-*]\s*/, '').split('—')[0].trim();
      if (!body) return;
      items.push(body);

      const b = body.match(/(\d+)\s*상자/);
      if (b) boxes += Number(b[1]);
    });

    if (items.length) out.items = items.join(', ');
    if (boxes) out.boxes = String(boxes);

    // 주문자를 따로 못 찾았으면 받는 분과 같은 사람으로 봅니다
    // (기존 '이름' 한 줄짜리 문자도 그대로 지원됩니다).
    if (!out.orderer) out.orderer = out.name;

    return out;
  }

  // 받는 분 성함 칸이 필요한지 (주문자와 다를 때만) 판단합니다.
  const isSameName = () => $('#chkSameName').checked;

  function fillForm(data) {
    const orderer = data.orderer || data.name || '';
    const receiver = data.name || '';
    // 주문자와 받는 분이 실제로 다를 때만 체크를 풀고 칸을 보여줍니다.
    const differs = !!(orderer && receiver && orderer !== receiver);

    $('#fOrderer').value = orderer;
    $('#fName').value    = receiver;
    $('#chkSameName').checked  = !differs;
    $('#fieldReceiver').hidden = !differs;

    $('#fPhone').value = data.phone || '';
    $('#fAddr').value  = data.address || '';
    $('#fItems').value = data.items || '';
    $('#fBoxes').value = data.boxes || '';
    $('#fMemo').value  = data.memo || '';
  }

  function readForm() {
    const orderer = $('#fOrderer').value.trim();
    const same = isSameName();
    return {
      orderer,
      name:    same ? orderer : $('#fName').value.trim(),
      phone:   $('#fPhone').value.trim(),
      address: $('#fAddr').value.trim(),
      items:   $('#fItems').value.trim(),
      boxes:   Math.max(0, Number($('#fBoxes').value) || 0),
      memo:    $('#fMemo').value.trim(),
    };
  }

  function clearForm() {
    fillForm({});
    $('#pasteBox').value = '';
    editingId = null;
    $('#editingTag').hidden = true;
    $('#btnSave').textContent = '주문 저장하기';
  }

  /* ══════════ 저장 버튼 ══════════ */

  function saveOrder() {
    if (!isSameName() && !$('#fName').value.trim()) {
      toast('받는 분 성함을 입력해주세요.');
      $('#fName').focus();
      return;
    }

    const data = readForm();

    if (!data.orderer && !data.phone && !data.address) {
      toast('성함·전화·주소 중 하나는 적어주세요.');
      $('#fOrderer').focus();
      return;
    }

    if (editingId) {
      const i = orders.findIndex((o) => o.id === editingId);
      if (i >= 0) orders[i] = Object.assign({}, orders[i], data);
      toast('수정했습니다.');
    } else {
      orders.unshift(Object.assign({
        id: 'o' + Date.now() + Math.random().toString(36).slice(2, 6),
        date: todayKR(),
        sent: false,
        sentAt: null,
      }, data));
      toast('장부에 적었습니다 🍑');
    }

    save();
    clearForm();
    render();
  }

  /* ══════════ 택배 기사님께 보낼 문자 ══════════ */

  // 택배 기사님께는 가격이 필요 없습니다. 이름·전화·주소·상자 수만 적습니다.
  function buildCourierText() {
    const list = orders.filter((o) => !o.sent);
    if (!list.length) return '';

    const boxes = list.reduce((n, o) => n + (o.boxes || 0), 0);
    const head = [
      `[${SITE.farmName}] 발송 요청 ${prettyDate(todayKR())}`,
      `총 ${list.length}건${boxes ? ` · ${boxes}상자` : ''}`,
      '',
    ];

    const body = list.map((o, i) => {
      const rows = [`${i + 1}. ${o.name || '(이름 없음)'}  ${o.phone || ''}`.trim()];
      if (o.address) rows.push(`   ${o.address}`);

      // 택배 기사님께는 몇 상자인지만 있으면 됩니다.
      // 상자 수를 안 적으셨을 때만 주문 내용을 대신 넣습니다.
      const detail = o.boxes ? `${o.boxes}상자` : o.items;
      if (detail) rows.push(`   ${detail}`);
      if (o.memo) rows.push(`   * ${o.memo}`);

      return rows.join('\n');
    });

    return head.concat(body.join('\n\n')).join('\n');
  }

  function copyAll() {
    const text = buildCourierText();
    if (!text) {
      toast('발송 대기 중인 주문이 없습니다.');
      return;
    }
    copyText(text, '발송 목록을 복사했어요! 택배 기사님께 붙여넣어 보내주세요 📦');
  }

  function togglePreview() {
    const box = $('#copyPreview');
    if (!box.hidden) {
      box.hidden = true;
      $('#btnPreview').textContent = '복사될 내용 미리보기';
      return;
    }
    const text = buildCourierText();
    box.textContent = text || '발송 대기 중인 주문이 없습니다.';
    box.hidden = false;
    $('#btnPreview').textContent = '미리보기 닫기';
  }

  /* ══════════ 목록 그리기 ══════════ */

  function cardHtml(o) {
    const detail = [o.boxes ? `${o.boxes}상자` : '', o.items].filter(Boolean).join(' · ');
    // 주문자가 받는 분과 다를 때만 따로 보여줍니다 (같으면 한 번만 표시).
    const showOrderer = o.orderer && o.orderer !== o.name;

    return `
      <article class="litem ${o.sent ? 'litem--done' : ''}" data-id="${o.id}">
        <div class="litem__body">
          <p class="litem__name">
            ${esc(o.name) || '<span class="litem__dim">(이름 없음)</span>'}
            ${o.phone ? `<a class="litem__phone" href="tel:${esc(o.phone.replace(/[^0-9+]/g, ''))}">${esc(o.phone)}</a>` : ''}
          </p>
          ${showOrderer ? `<p class="litem__orderer">주문자 : <b>${esc(o.orderer)}</b></p>` : ''}
          ${o.address ? `<p class="litem__addr">${esc(o.address)}</p>` : ''}
          ${detail ? `<p class="litem__detail">${esc(detail)}</p>` : ''}
          ${o.memo ? `<p class="litem__memo">* ${esc(o.memo)}</p>` : ''}
          <p class="litem__date">
            ${prettyDate(o.date)} 접수${o.sent && o.sentAt ? ` · ${prettyDate(o.sentAt)} 발송` : ''}
          </p>
        </div>
        <div class="litem__btns">
          <button class="lmini" type="button" data-act="toggle">${o.sent ? '되돌리기' : '발송 완료'}</button>
          <button class="lmini" type="button" data-act="edit">수정</button>
          <button class="lmini lmini--del" type="button" data-act="del">삭제</button>
        </div>
      </article>`;
  }

  function render() {
    const waiting = orders.filter((o) => !o.sent);
    const done    = orders.filter((o) => o.sent);
    const boxes   = waiting.reduce((n, o) => n + (o.boxes || 0), 0);

    $('#waitCount').textContent = `${waiting.length}건${boxes ? ` · ${boxes}상자` : ''}`;
    $('#doneCount').textContent = `${done.length}건`;

    $('#waitList').innerHTML = waiting.length
      ? waiting.map(cardHtml).join('')
      : `<p class="lempty">아직 적어둔 주문이 없습니다.<br>위에서 문자 내용을 붙여넣고 저장해보세요.</p>`;

    $('#doneList').innerHTML = done.length
      ? done.map(cardHtml).join('')
      : `<p class="lempty">발송 완료로 옮긴 주문이 여기에 쌓입니다.</p>`;

    // 미리보기가 열려 있으면 내용도 갱신
    if (!$('#copyPreview').hidden) {
      $('#copyPreview').textContent = buildCourierText() || '발송 대기 중인 주문이 없습니다.';
    }
  }

  /* ══════════ 목록 버튼 ══════════ */

  function onListClick(e) {
    const btn = e.target.closest('.lmini');
    if (!btn) return;

    const id = btn.closest('.litem').dataset.id;
    const i = orders.findIndex((o) => o.id === id);
    if (i < 0) return;

    const act = btn.dataset.act;

    if (act === 'toggle') {
      orders[i].sent = !orders[i].sent;
      orders[i].sentAt = orders[i].sent ? todayKR() : null;
      save();
      render();
      toast(orders[i].sent ? '발송 완료로 옮겼습니다.' : '발송 대기로 되돌렸습니다.');
      return;
    }

    if (act === 'edit') {
      editingId = id;
      fillForm(orders[i]);
      $('#editingTag').hidden = false;
      $('#btnSave').textContent = '수정 내용 저장';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      $('#fOrderer').focus({ preventScroll: true });
      return;
    }

    if (act === 'del') {
      const who = orders[i].name || '이 주문';
      if (!confirm(`${who} 을(를) 장부에서 지울까요?\n지우면 되돌릴 수 없습니다.`)) return;
      orders.splice(i, 1);
      if (editingId === id) clearForm();
      save();
      render();
      toast('지웠습니다.');
    }
  }

  /* ══════════ 백업 ══════════ */

  function exportBackup() {
    if (!orders.length) {
      toast('저장된 주문이 없습니다.');
      return;
    }
    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 파일명에 한글을 쓰면 브라우저가 이름을 버리고 확장자 없는
    // 'download' 로 저장해버려서, 나중에 다시 불러올 수 없습니다.
    a.download = `peach-orders-${todayKR()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('백업 파일을 내려받았습니다.');
  }

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error('형식이 다릅니다');

        // 같은 id 는 건너뛰고 없는 것만 더합니다
        const have = new Set(orders.map((o) => o.id));
        const add = data.filter((o) => o && o.id && !have.has(o.id));
        orders = orders.concat(add);
        save();
        render();
        toast(`${add.length}건을 불러왔습니다.`);
      } catch (err) {
        toast('백업 파일을 읽지 못했습니다. 내려받은 파일이 맞는지 확인해주세요.');
      }
    };
    reader.readAsText(file);
  }

  function clearAll() {
    if (!orders.length) { toast('이미 비어 있습니다.'); return; }
    if (!confirm(`장부에 있는 ${orders.length}건을 모두 지웁니다.\n되돌릴 수 없으니, 먼저 백업 파일을 내려받아 두세요.\n\n정말 지울까요?`)) return;
    orders = [];
    save();
    clearForm();
    render();
    toast('모두 지웠습니다.');
  }

  /* ══════════ 시작 ══════════ */

  function init() {
    load();
    render();

    $('#btnParse').addEventListener('click', () => {
      const text = $('#pasteBox').value;
      if (!text.trim()) { toast('먼저 받은 문자를 붙여넣어 주세요.'); return; }

      const data = parseMessage(text);
      if (!data.name && !data.phone && !data.address) {
        toast('내용을 알아보지 못했습니다. 아래 칸에 직접 적어주세요.');
        return;
      }
      fillForm(data);
      toast('읽어왔습니다. 틀린 곳이 있으면 고쳐주세요.');
    });

    // 받는 분이 주문자와 같은지에 따라 성함 칸을 보이거나 숨깁니다.
    $('#chkSameName').addEventListener('change', () => {
      $('#fieldReceiver').hidden = isSameName();
      if (!isSameName()) $('#fName').focus();
    });

    $('#btnSave').addEventListener('click', saveOrder);
    $('#btnReset').addEventListener('click', () => { clearForm(); toast('입력한 내용을 지웠습니다.'); });
    $('#btnCopyAll').addEventListener('click', copyAll);
    $('#btnPreview').addEventListener('click', togglePreview);
    $('#btnExport').addEventListener('click', exportBackup);
    $('#btnClear').addEventListener('click', clearAll);

    $('#fileImport').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importBackup(file);
      e.target.value = '';
    });

    $('#waitList').addEventListener('click', onListClick);
    $('#doneList').addEventListener('click', onListClick);
  }

  document.addEventListener('DOMContentLoaded', init);
})();

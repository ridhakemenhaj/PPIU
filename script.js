/* ================================================
   PPIU ACEH — Main Script
   ================================================ */
(function () {
  'use strict';

  // ── STATE ────────────────────────────────────
  let query        = '';
  let filterStatus = '';
  let filterKota   = '';

  // ── DOM ──────────────────────────────────────
  const searchInput  = document.getElementById('searchInput');
  const clearBtn     = document.getElementById('clearBtn');
  const filterTipe   = document.getElementById('filterTipe');
  const filterKotaSel = document.getElementById('filterKota');
  const cardsGrid    = document.getElementById('cardsGrid');
  const emptyState   = document.getElementById('emptyState');
  const resultCount  = document.getElementById('resultCount');

  // Stats
  const sTot    = document.getElementById('sTot');
  const sPusat  = document.getElementById('sPusat');
  const sCabang = document.getElementById('sCabang');
  const sKota   = document.getElementById('sKota');

  // Modal
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');
  const mBadge    = document.getElementById('mBadge');
  const mNama     = document.getElementById('mNama');
  const mKota     = document.getElementById('mKota');
  const mSK       = document.getElementById('mSK');
  const mAlamat   = document.getElementById('mAlamat');
  const mTipe     = document.getElementById('mTipe');

  // Navbar
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const navLinks    = document.getElementById('navLinks');

  // ── INIT ─────────────────────────────────────
  function init () {
    // Unique cities
    const cities = [...new Set(PPIU_DATA.map(d => d.kota).filter(Boolean))].sort();
    cities.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k; opt.textContent = k;
      filterKotaSel.appendChild(opt);
    });

    // Stats counters
    animateNum(sTot,    PPIU_DATA.length);
    animateNum(sPusat,  PPIU_DATA.filter(d => d.status === 'PUSAT').length);
    animateNum(sCabang, PPIU_DATA.filter(d => d.status === 'CABANG').length);
    animateNum(sKota,   cities.length);

    render();

    // Events
    searchInput.addEventListener('input', onSearch);
    clearBtn.addEventListener('click', clearSearch);
    filterKotaSel.addEventListener('change', () => { filterKota = filterKotaSel.value; render(); });
    filterTipe.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        filterTipe.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterStatus = chip.dataset.value;
        render();
      });
    });

    // Modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Navbar scroll
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Hamburger
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close nav when link clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
      });
      navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    });
  }

  // ── SEARCH ───────────────────────────────────
  function onSearch () {
    query = searchInput.value.trim();
    clearBtn.classList.toggle('show', query.length > 0);
    render();
  }

  function clearSearch () {
    searchInput.value = '';
    query = '';
    clearBtn.classList.remove('show');
    render();
    searchInput.focus();
  }

  // ── FILTER ───────────────────────────────────
  function getFiltered () {
    const q = query.toLowerCase();
    return PPIU_DATA
      .filter(d => {
        const okStatus = !filterStatus || d.status === filterStatus;
        const okKota   = !filterKota   || d.kota   === filterKota;
        const okQuery  = !q ||
          (d.nama     && d.nama.toLowerCase().includes(q))     ||
          (d.pimpinan && d.pimpinan.toLowerCase().includes(q)) ||
          (d.alamat   && d.alamat.toLowerCase().includes(q))   ||
          (d.kota     && d.kota.toLowerCase().includes(q));
        return okStatus && okKota && okQuery;
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  // ── HIGHLIGHT ────────────────────────────────
  function hl (text, q) {
    if (!q || !text) return text || '';
    const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  // ── RENDER ───────────────────────────────────
  function render () {
    const list = getFiltered();
    const q = query.toLowerCase();

    resultCount.textContent = list.length
      ? `${list.length} travel ditemukan`
      : 'Tidak ada hasil';

    cardsGrid.innerHTML = '';

    if (!list.length) {
      emptyState.classList.add('show');
      return;
    }
    emptyState.classList.remove('show');

    list.forEach((item, idx) => {
      const card = buildCard(item, idx, q);
      cardsGrid.appendChild(card);
    });
  }

  // ── BUILD CARD ───────────────────────────────
  function buildCard (item, idx, q) {
    const el = document.createElement('div');
    el.className = 't-card';
    el.style.animationDelay = Math.min(idx * 0.04, 0.5) + 's';

    const isPusat   = item.status === 'PUSAT';
    const badgeCls  = isPusat ? 'badge-pusat' : 'badge-cabang';
    const badgeTxt  = isPusat ? 'Kantor Pusat' : 'Kantor Cabang';

    el.innerHTML = `
      <div class="card-top">
        <div class="card-num">${idx + 1}</div>
        <span class="badge ${badgeCls}">${badgeTxt}</span>
      </div>
      <div class="card-name">${hl(item.nama, q)}</div>
      <div class="card-footer-row">
        <span class="card-kota">📍 ${item.kota || '–'}</span>
        <span class="card-detail">Lihat Detail</span>
      </div>`;

    el.addEventListener('click', () => openModal(item));
    return el;
  }

  // ── MODAL ─────────────────────────────────────
  function openModal (item) {
    mBadge.textContent    = item.status === 'PUSAT' ? 'Kantor Pusat' : 'Kantor Cabang';
    mNama.textContent     = item.nama     || '–';
    mKota.textContent     = item.kota     || '–';
    mSK.textContent       = item.sk       || '–';
    mAlamat.textContent   = item.alamat   || '–';
    mTipe.textContent     = item.tipe     || '–';
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal () {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── COUNTER ANIM ─────────────────────────────
  function animateNum (el, target) {
    let val = 0;
    const step = Math.ceil(target / 50);
    const iv = setInterval(() => {
      val = Math.min(val + step, target);
      el.textContent = val;
      if (val >= target) clearInterval(iv);
    }, 28);
  }

  // ── SMOOTH SCROLL ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 8;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── START ─────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
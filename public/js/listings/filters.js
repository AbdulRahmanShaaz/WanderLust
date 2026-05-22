/**
 * WanderLust — Filters Panel JS
 * Handles: slide-in panel, backdrop, close, reset, price validation, tax switch
 */
(function () {
  'use strict';

  /* ── DOM refs ── */
  const filtersToggle  = document.getElementById('filtersToggle');
  const filtersPanel   = document.getElementById('filtersPanel');
  const closeFiltersBtn = document.getElementById('closeFilters');
  const backdrop       = document.getElementById('filtersBackdrop');
  const filtersForm    = document.getElementById('filtersForm');
  const filterResetBtn = document.getElementById('filterResetBtn');
  const taxSwitch      = document.getElementById('taxSwitch');

  /* ── Open/Close helpers ── */
  function openPanel() {
    if (!filtersPanel) return;
    filtersPanel.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (closeFiltersBtn) closeFiltersBtn.focus();
  }

  function closePanel() {
    if (!filtersPanel) return;
    filtersPanel.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
    if (filtersToggle) filtersToggle.focus();
  }

  /* ── Toggle button ── */
  if (filtersToggle) {
    filtersToggle.addEventListener('click', () => {
      filtersPanel.classList.contains('open') ? closePanel() : openPanel();
    });
  }

  /* ── Close button inside panel ── */
  if (closeFiltersBtn) {
    closeFiltersBtn.addEventListener('click', closePanel);
  }

  /* ── Backdrop click ── */
  if (backdrop) {
    backdrop.addEventListener('click', closePanel);
  }

  /* ── Escape key ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filtersPanel && filtersPanel.classList.contains('open')) {
      closePanel();
    }
  });

  /* ── Reset button: clear all filter params and redirect to clean listings ── */
  if (filterResetBtn) {
    filterResetBtn.addEventListener('click', () => {
      const url = new URL(window.location.href);
      ['minPrice', 'maxPrice', 'showTaxes', 'category'].forEach(k => url.searchParams.delete(k));
      window.location.href = url.toString();
    });
  }

  /* ── Tax switch: auto-submit form when toggled ── */
  if (taxSwitch && filtersForm) {
    taxSwitch.addEventListener('change', () => {
      // If unchecked, make sure showTaxes=false is submitted (by removing the field)
      // The checkbox only sends when checked, so we just submit
      filtersForm.submit();
    });
  }

  /* ── Price validation before form submit ── */
  if (filtersForm) {
    filtersForm.addEventListener('submit', (e) => {
      const minInput = filtersForm.querySelector('input[name="minPrice"]');
      const maxInput = filtersForm.querySelector('input[name="maxPrice"]');
      const min = Number(minInput?.value) || 0;
      const max = Number(maxInput?.value) || 0;
      if (min && max && min > max) {
        e.preventDefault();
        minInput.style.borderColor = '#FF385C';
        maxInput.style.borderColor = '#FF385C';
        minInput.focus();
        setTimeout(() => {
          minInput.style.borderColor = '';
          maxInput.style.borderColor = '';
        }, 2500);
      }
    });
  }

  /* ── Navbar search pill → focus hero search ── */
  const navSearchPill = document.querySelector('.search-pill');
  const heroSearchInput = document.getElementById('hero-search-input');

  if (navSearchPill && heroSearchInput) {
    navSearchPill.addEventListener('click', (e) => {
      e.preventDefault();
      heroSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      heroSearchInput.focus();
    });
  }

  /* ── Navbar "Anywhere" button → scroll to hero & focus search ── */
  const anywhereBtn = document.querySelector('.search-pill > button:first-child');
  if (anywhereBtn && heroSearchInput) {
    anywhereBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      heroSearchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => heroSearchInput.focus(), 400);
    });
  }

  /* ── Heart / wishlist toggle (visual only) ── */
  document.querySelectorAll('.card-favorite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btn.querySelector('i');
      if (!icon) return;
      const isSaved = icon.classList.contains('fa-solid');
      icon.classList.toggle('fa-regular', isSaved);
      icon.classList.toggle('fa-solid', !isSaved);
      btn.style.color = isSaved ? '' : '#FF385C';
    });
  });

})();

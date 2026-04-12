// Toast de notificación (elimina duplicados previos)
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Confirmación modal para acciones destructivas (Promise-based)
function showConfirm(msg) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = 'display:flex;position:fixed;inset:0;background:rgba(15,23,42,0.5);justify-content:center;align-items:center;z-index:2000;padding:20px;backdrop-filter:blur(4px)';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:24px;padding:36px;max-width:420px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,0.2);text-align:center">
        <div style="font-size:48px;margin-bottom:12px">⚠️</div>
        <h3 style="font-size:18px;color:#0f172a;margin-bottom:8px;font-weight:700">Confirmar</h3>
        <p style="color:#64748b;font-size:14px;margin-bottom:28px">${msg}</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-secondary" id="confirmNo" style="padding:11px 28px;border:2px solid #e2e8f0;border-radius:50px;font-weight:600;font-size:14px;background:#fff;color:#475569;cursor:pointer">Cancelar</button>
          <button class="btn btn-primary" id="confirmYes" style="padding:11px 28px;border:none;border-radius:50px;font-weight:600;font-size:14px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;cursor:pointer;box-shadow:0 4px 15px rgba(220,38,38,0.25)">Eliminar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirmYes').onclick = () => { overlay.remove(); resolve(true); };
    document.getElementById('confirmNo').onclick = () => { overlay.remove(); resolve(false); };
    overlay.onclick = e => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
  });
}

// Filtro de tabla en tiempo real por búsqueda
function setupTableSearch(inputId, tableBodyId, filterFn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableBodyId} tr`);
    rows.forEach(row => {
      row.style.display = filterFn ? (filterFn(row, q) ? '' : 'none') : (row.textContent.toLowerCase().includes(q) ? '' : 'none');
    });
  });
}

// Exportación a CSV con BOM para Excel (UTF-8)
function exportCSV(filename, headers, rows) {
  const bom = '\uFEFF';
  const csv = bom + headers.join(',') + '\n' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Paginador reutilizable con botones de navegación y contador
function createPager(containerId, perPage, onPageChange) {
  const state = { page: 1, total: 0, perPage };
  const container = document.getElementById(containerId);
  if (!container) return { setTotal() {}, getPage() { return { data: [], page: 1, total: 0 }; } };

  function render() {
    const totalPages = Math.max(1, Math.ceil(state.total / state.perPage));
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = '<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:16px 0;flex-wrap:wrap">';
    html += `<button class="btn-page" data-page="${state.page - 1}" ${state.page <= 1 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''} style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#475569;font-weight:600;font-size:13px;cursor:pointer">&laquo;</button>`;
    const start = Math.max(1, state.page - 2);
    const end = Math.min(totalPages, state.page + 2);
    for (let i = start; i <= end; i++) {
      html += `<button class="btn-page" data-page="${i}" style="padding:6px 12px;border:${i === state.page ? 'none' : '1px solid #e2e8f0'};border-radius:8px;background:${i === state.page ? 'linear-gradient(135deg,#2a17cf,#1a0d8a)' : '#fff'};color:${i === state.page ? '#fff' : '#475569'};font-weight:${i === state.page ? '700' : '600'};font-size:13px;cursor:pointer">${i}</button>`;
    }
    html += `<button class="btn-page" data-page="${state.page + 1}" ${state.page >= totalPages ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''} style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#475569;font-weight:600;font-size:13px;cursor:pointer">&raquo;</button>`;
    html += `<span style="font-size:12px;color:#94a3b8;margin-left:8px">${state.total} registros</span>`;
    html += '</div>';
    container.innerHTML = html;
    container.querySelectorAll('.btn-page').forEach(btn => {
      btn.onclick = () => {
        const p = parseInt(btn.dataset.page);
        if (p >= 1 && p <= totalPages && p !== state.page) {
          state.page = p;
          render();
          if (onPageChange) onPageChange(state.page);
        }
      };
    });
  }

  return {
    setTotal(n) { state.total = n; state.page = 1; render(); },
    getPage(data) {
      const start = (state.page - 1) * state.perPage;
      return { data: data.slice(start, start + state.perPage), page: state.page, total: state.total };
    },
    goTo(p) { state.page = p; render(); if (onPageChange) onPageChange(p); }
  };
}

// Formatea fechas: "hace X min" si reciente, o fecha local si antiguo
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

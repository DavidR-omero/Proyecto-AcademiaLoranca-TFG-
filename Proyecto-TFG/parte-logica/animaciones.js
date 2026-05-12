/* Load dynamic course preview */
(async function() {
    try {
        const res = await fetch('/api/courses');
        const { courses } = await res.json();
        const grid = document.getElementById('cpGrid');
        if (!grid || !courses) return;

        const sorted = [...courses].sort((a, b) => {
            const aFav = (a.teacher||'').toLowerCase().includes('isabel')||(a.teacher||'').toLowerCase().includes('laura');
            const bFav = (b.teacher||'').toLowerCase().includes('isabel')||(b.teacher||'').toLowerCase().includes('laura');
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return a.id - b.id;
        });

        const colors = ['#7c3aed','#0891b2','#059669','#d97706','#db2777','#dc2626','#2a17cf','#00d5ff'];
        const icons = ['🛡️','🤖','📊','💻','📈','🎨','📚','📝'];

        grid.innerHTML = sorted.map(c => {
            const isFav = (c.teacher||'').toLowerCase().includes('isabel')||(c.teacher||'').toLowerCase().includes('laura');
            const icon = icons[c.id % icons.length];
            return `<a href="./grupos.html#curso-${c.id}" class="cp-card ${isFav ? 'cp-featured' : ''}">
                <div class="cp-icon">${icon}</div>
                <div class="cp-name">${c.name}</div>
                <div class="cp-teacher">👨‍🏫 ${c.teacher || ''}</div>
                <span class="cp-price">${c.price ? c.price.toFixed(2).replace('.',',') + ' €/mes' : 'Consultar'}</span>
            </a>`;
        }).join('');
    } catch {}
})();

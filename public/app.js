const api = '/api/students';
const tbody = document.querySelector('#studentsTable tbody');
const form = document.getElementById('studentForm');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('search');

async function fetchStudents() {
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('Fetch students error:', err);
    alert('Error loading students. Check console.');
    return [];
  }
}

function render(students) {
  tbody.innerHTML = '';
  if (!students || students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-slate-500">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 6H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-4m-6 8a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          No students found
        </td>
      </tr>
    `;
    return;
  }
  
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-blue-50 transition-colors';
    tr.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-slate-900">${s.id}</td>
      <td class="px-6 py-4 text-sm font-medium text-slate-900">${s.name}</td>
      <td class="px-6 py-4 text-sm text-slate-600">${s.email || '-'}</td>
      <td class="px-6 py-4 text-sm text-slate-600">${s.age || '-'}</td>
      <td class="px-6 py-4 text-sm space-x-2 flex">
        <button data-id="${s.id}" class="edit bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:-translate-y-0.5 shadow">Edit</button>
        <button data-id="${s.id}" class="del bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:-translate-y-0.5 shadow">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function refresh() {
  const students = await fetchStudents();
  const q = searchInput.value.trim().toLowerCase();
  render(students.filter(s => s.name.toLowerCase().includes(q)));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const id = document.getElementById('studentId').value;
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      age: parseInt(document.getElementById('age').value) || null
    };
    
    let res;
    if (id) {
      res = await fetch(`${api}/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    } else {
      res = await fetch(api, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    }
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    form.reset();
    document.getElementById('studentId').value = '';
    refresh();
    
    // Success feedback
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✓ Saved!';
    submitBtn.classList.add('bg-green-500', 'from-green-500', 'to-green-600');
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.classList.remove('bg-green-500', 'from-green-500', 'to-green-600');
    }, 2000);
  } catch (err) {
    console.error('Save student error:', err);
    alert('Error saving student');
  }
});

resetBtn.addEventListener('click', () => { form.reset(); document.getElementById('studentId').value = ''; });

tbody.addEventListener('click', async (e) => {
  try {
    if (e.target.classList.contains('edit')) {
      const id = e.target.dataset.id;
      const res = await fetch(`${api}/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const s = await res.json();
      document.getElementById('studentId').value = s.id;
      document.getElementById('name').value = s.name;
      document.getElementById('email').value = s.email || '';
      document.getElementById('age').value = s.age || '';
      
      // Scroll to form on mobile
      if (window.innerWidth < 1024) {
        document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
      }
    } else if (e.target.classList.contains('del')) {
      const id = e.target.dataset.id;
      if (confirm('Delete student #' + id + '?')) {
        const res = await fetch(`${api}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        refresh();
      }
    }
  } catch (err) {
    console.error('Action error:', err);
    alert('Error performing action');
  }
});

searchInput.addEventListener('input', refresh);

// Initial load
refresh();



const api = '/api/students';
const tbody = document.querySelector('#studentsTable tbody');
const form = document.getElementById('studentForm');
const resetBtn = document.getElementById('resetBtn');
const searchInput = document.getElementById('search');

async function fetchStudents() {
  const res = await fetch(api);
  return res.json();
}

function render(students) {
  tbody.innerHTML = '';
  students.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.id}</td><td>${s.name}</td><td>${s.email||''}</td><td>${s.age||''}</td>
      <td>
        <button data-id="${s.id}" class="edit">Edit</button>
        <button data-id="${s.id}" class="del">Delete</button>
      </td>`;
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
  const id = document.getElementById('studentId').value;
  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    age: parseInt(document.getElementById('age').value) || null
  };
  if (id) {
    await fetch(`${api}/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  } else {
    await fetch(api, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  }
  form.reset();
  document.getElementById('studentId').value = '';
  refresh();
});

resetBtn.addEventListener('click', () => { form.reset(); document.getElementById('studentId').value = ''; });

tbody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit')) {
    const id = e.target.dataset.id;
    const res = await fetch(`${api}/${id}`);
    const s = await res.json();
    document.getElementById('studentId').value = s.id;
    document.getElementById('name').value = s.name;
    document.getElementById('email').value = s.email || '';
    document.getElementById('age').value = s.age || '';
  } else if (e.target.classList.contains('del')) {
    const id = e.target.dataset.id;
    if (confirm('Delete student #' + id + '?')) {
      await fetch(`${api}/${id}`, { method: 'DELETE' });
      refresh();
    }
  }
});

searchInput.addEventListener('input', refresh);

refresh();

/* PAINEL ADMINISTRATIVO
Faz o login chamando o backend, CRUD no banco de dados
Envia imagens para pasta uploads do servidor. */

const TOKEN_KEY = 'imobiliaria_token';
let listaImoveis = [];

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

async function login() {
  const username = document.getElementById('loginUser')?.value || '';
  const password = document.getElementById('loginPass')?.value || '';
  const erro = document.getElementById('loginError');

  if (erro) erro.innerText = '';

  try {
    const resposta = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      if (erro) erro.innerText = dados.error || 'Erro ao fazer login.';
      return;
    }

    setToken(dados.token);
    mostrarPainelAdmin();
  } catch (error) {
    if (erro) erro.innerText = 'Servidor indisponível.';
  }
}

function logout() {
  removeToken();
  protegerPaginaAdmin();
}

function protegerPaginaAdmin() {
  const loginScreen = document.getElementById('login-screen');
  const adminPanel = document.getElementById('admin-panel');

  if (!loginScreen || !adminPanel) return;

  if (getToken()) {
    loginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    carregarImoveisAdmin();
  } else {
    loginScreen.classList.remove('hidden');
    adminPanel.classList.add('hidden');
  }
}

function mostrarPainelAdmin() {
  document.getElementById('login-screen')?.classList.add('hidden');
  document.getElementById('admin-panel')?.classList.remove('hidden');
  carregarImoveisAdmin();
}

async function carregarImoveisAdmin() {
  const resposta = await fetch('/api/properties');
  listaImoveis = await resposta.json();
  renderAdminList();
}

function montarFormData() {
  const formData = new FormData();

  formData.append('id', document.getElementById('id').value);
  formData.append('title', document.getElementById('title').value);
  formData.append('price', document.getElementById('price').value);
  formData.append('specs', document.getElementById('specs').value);
  formData.append('location', document.getElementById('location').value);
  formData.append('type', document.getElementById('type').value);
  formData.append('image', document.getElementById('image').value);

  const imageFile = document.getElementById('imageFile').files[0];
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }

  return formData;
}

async function savePropertyFromForm() {
  const idOriginal = document.getElementById('editingId')?.value || '';
  const id = document.getElementById('id').value;
  const title = document.getElementById('title').value;
  const price = document.getElementById('price').value;

  if (!id || !title || !price) {
    alert('Preencha pelo menos código, título e preço.');
    return;
  }

  const url = idOriginal ? `/api/properties/${encodeURIComponent(idOriginal)}` : '/api/properties';
  const method = idOriginal ? 'PUT' : 'POST';

  const resposta = await fetch(url, {
    method,
    headers: authHeaders(),
    body: montarFormData()
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.error || 'Erro ao salvar imóvel.');
    return;
  }

  alert(idOriginal ? 'Imóvel editado com sucesso!' : 'Imóvel cadastrado com sucesso!');
  clearForm();
  carregarImoveisAdmin();
}

function editProperty(id) {
  const imovel = listaImoveis.find(item => item.id === id);

  if (!imovel) {
    alert('Imóvel não encontrado.');
    return;
  }

  document.getElementById('editingId').value = imovel.id;
  document.getElementById('id').value = imovel.id;
  document.getElementById('title').value = imovel.title;
  document.getElementById('price').value = imovel.price;
  document.getElementById('specs').value = imovel.specs || '';
  document.getElementById('location').value = imovel.location || '';
  document.getElementById('type').value = imovel.type || 'Apartamento';
  document.getElementById('image').value = imovel.image || '';
  document.getElementById('imageFile').value = '';

  const formTitle = document.getElementById('formTitle');
  if (formTitle) formTitle.innerText = 'Editar imóvel';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProperty(id) {
  const confirmar = confirm('Tem certeza que deseja excluir este imóvel?');
  if (!confirmar) return;

  const resposta = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.error || 'Erro ao excluir imóvel.');
    return;
  }

  alert('Imóvel excluído com sucesso!');
  carregarImoveisAdmin();
}

function clearForm() {
  const campos = ['editingId', 'id', 'title', 'price', 'specs', 'location', 'image'];

  campos.forEach(campo => {
    const input = document.getElementById(campo);
    if (input) input.value = '';
  });

  const imageFile = document.getElementById('imageFile');
  if (imageFile) imageFile.value = '';

  const tipo = document.getElementById('type');
  if (tipo) tipo.value = 'Apartamento';

  const formTitle = document.getElementById('formTitle');
  if (formTitle) formTitle.innerText = 'Cadastrar novo imóvel';
}

function renderAdminList() {
  const adminList = document.getElementById('admin-list');
  const adminCount = document.getElementById('admin-count');

  if (!adminList) return;

  adminList.innerHTML = '';
  if (adminCount) adminCount.innerText = listaImoveis.length;

  listaImoveis.forEach(imovel => {
    adminList.innerHTML += `
      <div class="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <img src="${imovel.image || 'https://via.placeholder.com/800x500?text=Sem+imagem'}" class="w-full h-44 object-cover">
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">${imovel.type || ''}</span>
            <span class="text-gray-400 text-xs">Cód: ${imovel.id}</span>
          </div>
          <h4 class="font-bold text-lg mb-1">${imovel.title}</h4>
          <p class="text-blue-600 font-extrabold text-xl mb-2">${imovel.price}</p>
          <p class="text-gray-500 text-sm mb-4">📍 ${imovel.location || ''} • ${imovel.specs || ''}</p>
          <div class="flex gap-2">
            <button onclick="editProperty('${imovel.id}')" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg">Editar</button>
            <button onclick="deleteProperty('${imovel.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg">Excluir</button>
          </div>
        </div>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', protegerPaginaAdmin);

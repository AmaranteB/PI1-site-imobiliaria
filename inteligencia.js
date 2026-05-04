// LOGIN SIMPLES
// O sistema de login deste trabalho foi feito apenas no frontend conforme pedido pela univesp no PI 1
// Não sendo indicado o uso, já que não tem segurança real.

const USER_ADMIN = "admin";
const PASS_ADMIN = "1234";

// Os imóveis são cadastrados no navegador devido a limitação do frontend html+JS.
// Deste modo ao atualizar a página os imóveis não somem.

const STORAGE_IMOVEIS = "imoveis";
const STORAGE_LOGIN = "logado";

// Variável que recebe os dados do localstorage ou do banco temporário.

let listaImoveis = [];

// Carrega imóveis salvos no navegador ou usa o banco temporário original
function carregarImoveis() {
    const dadosSalvos = localStorage.getItem(STORAGE_IMOVEIS);

    if (dadosSalvos) {
        listaImoveis = JSON.parse(dadosSalvos);
        return;
    }

    listaImoveis = properties;
    salvarNoLocalStorage();
}

// Salva imóveis no navegador
function salvarNoLocalStorage() {
    localStorage.setItem(STORAGE_IMOVEIS, JSON.stringify(listaImoveis));
}

// Abre login em página separada
function abrirLogin() {
    window.location.href = "admin.html";
}

function fecharLogin() {
}

// Faz login
function login() {
    const usuario = document.getElementById("loginUser")?.value || "";
    const senha = document.getElementById("loginPass")?.value || "";
    const erro = document.getElementById("loginError");

    if (usuario === USER_ADMIN && senha === PASS_ADMIN) {
        localStorage.setItem(STORAGE_LOGIN, "true");
        mostrarPainelAdmin();
        return;
    }

    if (erro) {
        erro.innerText = "Usuário ou senha incorretos.";
    }
}

// Faz logout
function logout() {
    localStorage.removeItem(STORAGE_LOGIN);
    protegerPaginaAdmin();
}
// impedir que o painel adm apareça sem login
function protegerPaginaAdmin() {
    const loginScreen = document.getElementById("login-screen");
    const adminPanel = document.getElementById("admin-panel");

    // Se esses elementos não existem, significa que estamos no index.html.
    if (!loginScreen || !adminPanel) {
        return;
    }

    if (localStorage.getItem(STORAGE_LOGIN) === "true") {
        loginScreen.classList.add("hidden");
        adminPanel.classList.remove("hidden");
        renderAdminList();
    } else {
        loginScreen.classList.remove("hidden");
        adminPanel.classList.add("hidden");
    }
}

// Mostra painel adm se estiver logado
function mostrarPainelAdmin() {
    const loginScreen = document.getElementById("login-screen");
    const adminPanel = document.getElementById("admin-panel");

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (adminPanel) {
        adminPanel.classList.remove("hidden");
    }

    renderAdminList();
}

// Função para criar o card no HTML
        function renderProperties(items) {
            const grid = document.getElementById('property-grid');
            const count = document.getElementById('count');
            if (!grid || !count) {
                return;
            }



            grid.innerHTML = '';
            count.innerText = items.length;

            items.forEach(p => {
                // Link do WhatsApp com a mensagem automática do imóvel
                const msg = encodeURIComponent(`Olá! Vi o imóvel ${p.id} (${p.title}) no site e gostaria de mais informações.`);
                const wppUrl = `https://wa.me/5511999999999?text=${msg}`;

                grid.innerHTML += `
                    <div class="property-card bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                        <img src="${p.image}" class="w-full h-56 object-cover">
                        <div class="p-5">
                            <div class="flex justify-between items-start mb-2">
                                <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">${p.type}</span>
                                <span class="text-gray-400 text-xs">Cód: ${p.id}</span>
                            </div>
                            <h4 class="font-bold text-lg mb-1">${p.title}</h4>
                            <p class="text-blue-600 font-extrabold text-xl mb-3">${p.price}</p>
                            <div class="text-gray-500 text-sm mb-4">📍 ${p.location} • ${p.specs}</div>
                            <a href="${wppUrl}" target="_blank" class="block w-full bg-green-500 hover:bg-green-600 text-white text-center font-bold py-3 rounded-xl transition shadow-lg shadow-green-100">
                                💬 Quero mais informações
                            </a>
                        </div>
                    </div>
                `;
            });
        }

        // Função de Filtro
        function filterItems(category) {
            // Atualiza os botões visuais
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-blue-600', 'text-white');
                btn.classList.add('bg-white', 'text-gray-800');
            });

            const evento = window.event;
            if (evento && evento.target) {
                
            
                event.target.classList.add('active', 'bg-blue-600', 'text-white');
            }

            if(category === 'Todos') {
                renderProperties(listaImoveis);
            } else if (category === 'Centro') {
                renderProperties(listaImoveis.filter(p => p.location === 'Centro'));
            } else {
                renderProperties(listaImoveis.filter(p => p.type === category));
            }
        }

        // Inicializa o site com todos os imóveis salvos
        renderProperties(listaImoveis);

        // Se já estiver logado, deixa o painel disponível
        if (localStorage.getItem("logado") === "true") {
            mostrarPainelAdmin();
        }

// Salva imóvel novo ou editado
function savePropertyFromForm() {
    const idOriginal = document.getElementById("editingId")?.value || "";

    const imovel = {
        id: document.getElementById("id").value,
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        specs: document.getElementById("specs").value,
        location: document.getElementById("location").value,
        type: document.getElementById("type").value,
        image: document.getElementById("image").value
    };

    if (!imovel.id || !imovel.title || !imovel.price) {
        alert("Preencha pelo menos código, título e preço.");
        return;
    }

    if (idOriginal) {
        listaImoveis = listaImoveis.map(item => {
            if (item.id === idOriginal) {
                return imovel;
            }
            return item;
        });

        alert("Imóvel editado com sucesso!");
    } else {
        const codigoJaExiste = listaImoveis.some(item => item.id === imovel.id);

        if (codigoJaExiste) {
            alert("Já existe um imóvel com esse código.");
            return;
        }

        listaImoveis.push(imovel);
        alert("Imóvel cadastrado com sucesso!");
    }

    salvarNoLocalStorage();
    renderProperties(listaImoveis);
    renderAdminList();
    clearForm();
}

function salvarImovel() {
    savePropertyFromForm();
}

// Função editar imóvel
function editProperty(id) {
    const imovel = listaImoveis.find(item => item.id === id);

    if (!imovel) {
        alert("Imóvel não encontrado.");
        return;
    }

    document.getElementById("editingId").value = imovel.id;
    document.getElementById("id").value = imovel.id;
    document.getElementById("title").value = imovel.title;
    document.getElementById("price").value = imovel.price;
    document.getElementById("specs").value = imovel.specs;
    document.getElementById("location").value = imovel.location;
    document.getElementById("type").value = imovel.type;
    document.getElementById("image").value = imovel.image;

    const formTitle = document.getElementById("formTitle");
    if (formTitle) {
        formTitle.innerText = "Editar imóvel";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function editarImovel(id) {
    editProperty(id);
}

// Exclui imóvel
function deleteProperty(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este imóvel?");

    if (!confirmar) {
        return;
    }

    listaImoveis = listaImoveis.filter(item => item.id !== id);
    salvarNoLocalStorage();
    renderProperties(listaImoveis);
    renderAdminList();

    alert("Imóvel excluído com sucesso!");
}

// Limpa o formulário
function limparFormulario() {
    document.getElementById("editando-id").value = "";
    document.getElementById("form-id").value = "";
    document.getElementById("form-title").value = "";
    document.getElementById("form-price").value = "";
    document.getElementById("form-specs").value = "";
    document.getElementById("form-location").value = "";
    document.getElementById("form-type").value = "";
    document.getElementById("form-image").value = "";
}

function deletarImovel(id) {
    deleteProperty(id);
}
// função limpar formulário
function clearForm() {
    const campos = ["editingId", "id", "title", "price", "specs", "location", "image"];

    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.value = "";
        }
    });

    const tipo = document.getElementById("type");
    if (tipo) {
        tipo.value = "Apartamento";
    }

    const formTitle = document.getElementById("formTitle");
    if (formTitle) {
        formTitle.innerText = "Cadastrar novo imóvel";
    }
}

function limparFormulario() {
    clearForm();
}

// Renderiza lista administrativa
function renderAdminList() {
    const adminList = document.getElementById("admin-list");
    const adminCount = document.getElementById("admin-count");

    if (!adminList) {
        return;
    }

    adminList.innerHTML = "";

    if (adminCount) {
        adminCount.innerText = listaImoveis.length;
    }

    listaImoveis.forEach(imovel => {
        adminList.innerHTML += `
            <div class="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <img src="${imovel.image}" class="w-full h-44 object-cover">
                <div class="p-5">
                    <div class="flex justify-between items-start mb-2">
                        <span class="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">${imovel.type}</span>
                        <span class="text-gray-400 text-xs">Cód: ${imovel.id}</span>
                    </div>
                    <h4 class="font-bold text-lg mb-1">${imovel.title}</h4>
                    <p class="text-blue-600 font-extrabold text-xl mb-2">${imovel.price}</p>
                    <p class="text-gray-500 text-sm mb-4">📍 ${imovel.location} • ${imovel.specs}</p>

                    <div class="flex gap-2">
                        <button onclick="editProperty('${imovel.id}')" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg">
                            Editar
                        </button>

                        <button onclick="deleteProperty('${imovel.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// carregar imóveis
document.addEventListener("DOMContentLoaded", function () {
    carregarImoveis();
    renderProperties(listaImoveis);
    protegerPaginaAdmin();
});
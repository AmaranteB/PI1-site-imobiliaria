// Função para criar o card no HTML
        function renderProperties(items) {
            const grid = document.getElementById('property-grid');
            const count = document.getElementById('count');
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
            event.target.classList.add('active', 'bg-blue-600', 'text-white');

            if(category === 'Todos') {
                renderProperties(properties);
            } else if (category === 'Centro') {
                renderProperties(properties.filter(p => p.location === 'Centro'));
            } else {
                renderProperties(properties.filter(p => p.type === category));
            }
        }

        // Inicializa o site com todos os imóveis
        renderProperties(properties);

// Lógica de login

const USER = "admin";
const PASS = "1234";

function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    if (user === USER && pass === PASS) {
        localStorage.setItem("logado", "true");
        document.getElementById("login-screen").style.display = "none";
    } else {
        document.getElementById("error").innerText = "Usuário ou senha inválidos";
    }
}

// verifica ao abrir o site
window.onload = function () {
    if (localStorage.getItem("logado") === "true") {
        document.getElementById("login-screen").style.display = "none";
    }
}

// função para adicionar imóvel

function addProperty() {

    if (localStorage.getItem("logado") !== "true") {
        alert("Você precisa estar logado!");
        return;
    }

    const novo = {
        id: document.getElementById("id").value,
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        specs: document.getElementById("specs").value,
        location: document.getElementById("location").value,
        type: document.getElementById("type").value,
        image: document.getElementById("image").value
    };

    properties.push(novo);

    renderProperties(properties);

    alert("Imóvel adicionado com sucesso!");
}
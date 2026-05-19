# Imobiliária Novo Horizonte - versão final

Projeto Integrador 1 - UNIVESP - Grupo 21
Projeto de um site de imobiliária, com sistema de login, cadastro e exclusão de imagens e textos em forma de anúncio

## Como rodar

1. Instale o Node.js.

```bash
npm install
```
2. Rode:

```bash
npm start
```
http://localhost:3000


## Estrutura das pastas

```text
imobiliaria-backend/
├── server.js                  # Servidor Express e rotas da API
├── package.json               # Dependências do projeto
├── .env.example               # Exemplo de configurações secretas
├── database/
│   └── db.js                  # Criação e acesso ao banco SQLite
├── public/
│   ├── index.html             # Página pública do site
│   ├── admin.html             # Página de login e CRUD
│   ├── app.js                 # JS da página pública
│   └── admin.js               # JS do painel administrativo
└── uploads/                   # Fotos enviadas 
```

## Status do projeto

Pronto, em constante aperfeiçoamento.
# 🚀 Projeto Mensageria - Sub-grupo 5

Este projeto faz parte da disciplina de **Cloud II** e foca no desenvolvimento de um microsserviço para consulta e processamento de pedidos. Este módulo é responsável pela interface de consulta ao banco de dados relacional e processamento de mensagens em tempo real via **Google Cloud Pub/Sub**, garantindo a recuperação de dados de forma eficiente, segura e escalonável.

---

## 👥 Membros do Grupo e Responsabilidades

*   **1. Danilo Benedetti (Membro 1 - O Arquiteto de Dados)**:
    *   **Foco Principal**: Modelagem e infraestrutura do banco de dados relacional, incluindo a criação do DER, os scripts SQL (`schema.sql`) e a configuração da conexão com Node.js (`database.js`).
*   **2. Gustavo Moreira (Membro 2 - O Mensageiro)**:
    *   **Foco Principal**: Desenvolvimento do consumidor de mensageria, adaptando o `index.js` para realizar o parse das mensagens do Pub/Sub, persistir os dados no PostgreSQL e garantir o registro do timestamp da inserção.
*   **3. Thiago Resende (Membro 3 - O Engenheiro de Rotas)**:
    *   **Foco Principal**: Criação da API e sistemas de busca, sendo responsável por configurar o servidor Express, o endpoint `GET /orders` e a lógica de filtros dinâmicos, paginação e ordenação via SQL.
*   **4. Wilton Monteiro (Membro 4 - O Lapidador do Payload)**:
    *   **Foco Principal**: Tratamento de dados e regras de negócio, processando os resultados do banco de dados para realizar cálculos de totais e estruturar o JSON aninhado final conforme exigido.

---

## 🛠️ Tecnologias Utilizadas
*   **Runtime**: ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
*   **Framework**: ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
*   **Banco de Dados**: ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
*   **Messaging**: ![Google Cloud Pub/Sub](https://img.shields.io/badge/Google_Cloud-Pub/Sub-4285F4?style=flat&logo=googlecloud&logoColor=white)
*   **Infraestrutura**: ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

---

## 🏗️ Configuração da Infraestrutura (Docker)

Para garantir que o ambiente de desenvolvimento seja idêntico para todos e facilite o deploy em Cloud, utilizamos Docker para gerenciar o banco de dados.

### 1. Iniciar o Banco de Dados
Execute o comando abaixo no terminal para subir a instância do PostgreSQL:

```bash
docker run --name pg-mensageria \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=suasenha \
  -e POSTGRES_DB=mensageria_db \
  -p 5432:5432 \
  -d postgres
```

### 2. Criar Estrutura de Tabelas (Schema)
Após o container estar ativo, importe a estrutura das tabelas (clientes, produtos, pedidos e itens):

```bash
docker exec -i pg-mensageria psql -U postgres -d mensageria_db < BD/schema.sql
```

---

## ⚙️ Configuração da Aplicação

### 1. Variáveis de Ambiente
Certifique-se de ter um arquivo `.env` na raiz do projeto com as seguintes credenciais:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=suasenha
DB_NAME=mensageria_db
```

### 2. Credenciais Google Cloud
O listener do Pub/Sub (`index.js`) exige que o arquivo de chaves `key-grupo5.json` esteja na raiz do projeto.

---

## 🚀 Como Executar

### Instalar dependências:
```bash
npm install
```

### 📡 Rodar o Listener (Processamento de Mensagens)
O listener fica ouvindo as mensagens do Pub/Sub e persistindo-as no banco:
```bash
node index.js
```

### 🌐 Rodar o Servidor API (Consulta de Pedidos)
Inicia o servidor Express para servir os endpoints:
```bash
node server.js
```

---

## 📡 Documentação da API

### `GET /orders`
Retorna os dados detalhados dos pedidos, realizando o cruzamento de informações (**JOIN**) entre as tabelas do sistema.

#### Parâmetros de Filtro (Query Params)

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `uuid` | String | Filtra por um UUID de pedido específico. |
| `codigoCliente` | Int | Filtra pedidos de um cliente específico pelo seu ID. |
| `status` | String | Filtra pelo status (ex: `created`, `paid`, `shipped`). |
| `product_name` | String | Busca parcial por nome de produto (**Case Insensitive**). |
| `pagina` | Int | Número da página para paginação (Padrão: 1). |

#### Exemplos de Requisição:
*   **Filtro por Status**: `GET http://localhost:3000/orders?status=paid`
*   **Busca por Produto**: `GET http://localhost:3000/orders?product_name=Cloud`
*   **Paginação**: `GET http://localhost:3000/orders?pagina=2`

---

## 🛠️ Detalhes de Engenharia (Visão Geral)

O projeto segue uma arquitetura modular dividida entre os membros:

1.  **Modelagem e Infra (Danilo)**: Base sólida com Docker e PostgreSQL, garantindo que o ambiente seja replicável.
2.  **Consumo e Persistência (Gustavo)**: Ponte entre o Pub/Sub e o banco, garantindo que nenhum dado seja perdido e que o tempo de entrada seja registrado.
3.  **API e Buscas (Thiago)**: Porta de saída dos dados, permitindo consultas flexíveis e eficientes através de filtros e paginação.
4.  **Regras e Tratamento (Wilton)**: A "lapidação" final, transformando linhas de tabelas em um objeto JSON rico, calculado e estruturado.
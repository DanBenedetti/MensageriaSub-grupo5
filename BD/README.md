# Infraestrutura de Banco de Dados

Esta pasta contém os scripts de modelagem e a configuração de conexão com o Banco de Dados PostgreSQL.

## Arquivos
- `schema.sql`: Script de criação das tabelas (`clientes`, `produtos`, `pedidos`, `itens_pedido`).
- `database.js`: Módulo de conexão (Pool) para o Node.js usando o driver `pg`.
- `.env.example`: Modelo de credenciais necessárias.

## Como configurar o ambiente

1. **Criação das Tabelas:**
   Execute o conteúdo do arquivo `schema.sql` no seu servidor PostgreSQL.
   ```bash
   psql -U seu_usuario -d seu_banco -f BD/schema.sql
   ```

2. **Variáveis de Ambiente:**
   Na **raiz do projeto**, crie um arquivo chamado `.env` e preencha com as suas credenciais (conforme exemplo `.env.example` localizado nesta pasta).
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=sua_senha
   DB_NAME=projeto_mensageria

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    documento VARCHAR(20) NOT NULL
);

-- Tabela de Produtos (simplificada para o projeto)
CREATE TABLE IF NOT EXISTS produtos (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100),
    sub_categoria VARCHAR(100)
);

-- Tabela de Pedidos
-- Status sugeridos pelo professor: created, paid, shipped, delivered, canceled
CREATE TABLE IF NOT EXISTS pedidos (
    uuid VARCHAR(50) PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    canal VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    data_criacao_payload TIMESTAMP NOT NULL,
    data_indexacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Requisito do professor
    vendedor_nome VARCHAR(255), -- Para simplificar a infraestrutura mínima
    vendedor_id INT,
    vendedor_cidade VARCHAR(100),
    vendedor_estado VARCHAR(2)
);

-- Tabela de Itens do Pedido (Relacionamento N:M)
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_uuid VARCHAR(50) REFERENCES pedidos(uuid),
    produto_id INT REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_unitario_no_momento DECIMAL(10, 2) NOT NULL -- Preço capturado no momento da venda
);

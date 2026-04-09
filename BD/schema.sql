-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    documento VARCHAR(20) NOT NULL
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100),
    sub_categoria VARCHAR(100)
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    uuid VARCHAR(50) PRIMARY KEY,
    cliente_id INT REFERENCES clientes(id),
    canal VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    data_criacao_payload TIMESTAMP NOT NULL,
    data_indexacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vendedor_nome VARCHAR(255),
    vendedor_id INT,
    vendedor_cidade VARCHAR(100),
    vendedor_estado VARCHAR(2)
);

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_uuid VARCHAR(50) REFERENCES pedidos(uuid),
    produto_id INT REFERENCES produtos(id),
    quantidade INT NOT NULL,
    preco_unitario_no_momento DECIMAL(10, 2) NOT NULL
);

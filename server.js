const express = require('express');
const db = require('./BD/database');
const { formatOrders } = require('./utils/orderFormatter'); 
const app = express();
const port = 3000;

app.get('/orders', async (req, res) => {
  try {
    // 1. Captura os parâmetros da URL (Query Params)
    
    const { uuid, codigoCliente, status, product_name, produto_id, pagina } = req.query;

    // 1.1. Converte para número (base 10)
    let numPagina = parseInt(pagina, 10);

    // 1.2. Valida: Se não for um número ou for menor que 1, volta para a página 1
    if (isNaN(numPagina) || numPagina < 1) {
       numPagina = 1;
    }

    const limite = 10;
    const offset = (numPagina - 1) * limite;

    // 2. Base da Query com CTE (para garantir que o LIMIT se aplique aos PEDIDOS, não aos ITENS)
    let queryText = `
      WITH pedidos_filtrados AS (
        SELECT DISTINCT p.uuid, p.data_criacao_payload
        FROM pedidos p
        JOIN clientes c ON p.cliente_id = c.id
        JOIN itens_pedido ip ON p.uuid = ip.pedido_uuid
        JOIN produtos prod ON ip.produto_id = prod.id
        WHERE 1=1
    `;

    let params = [];

    // 3. Adição de Filtros Dinâmicos
    if (uuid) {
      params.push(uuid);
      queryText += ` AND p.uuid = $${params.length}`;
    }
    if (codigoCliente) {
      params.push(codigoCliente);
      queryText += ` AND c.id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      queryText += ` AND p.status = $${params.length}`;
    }
    if (product_name) {
      params.push(`%${product_name}%`);
      queryText += ` AND prod.nome ILIKE $${params.length}`;
    }
    if (produto_id) {
      params.push(produto_id);
      queryText += ` AND prod.id = $${params.length}`;
    }

    // Fecha o CTE e faz o Join final para pegar todos os itens dos pedidos filtrados
    queryText += `
        ORDER BY p.data_criacao_payload DESC
        LIMIT ${limite} OFFSET ${offset}
      )
      SELECT
        p.uuid,
        p.data_criacao_payload AS created_at,
        p.status,
        c.id AS customer_id,
        c.nome AS customer_name,
        c.email AS customer_email,
        ip.quantidade,
        ip.preco_unitario_no_momento,
        prod.id AS product_id,
        prod.nome AS product_name
      FROM pedidos p
      JOIN pedidos_filtrados pf ON p.uuid = pf.uuid
      JOIN clientes c ON p.cliente_id = c.id
      JOIN itens_pedido ip ON p.uuid = ip.pedido_uuid
      JOIN produtos prod ON ip.produto_id = prod.id
      ORDER BY p.data_criacao_payload DESC;
    `;

    // 5. Execução no Banco
    const resultado = await db.query(queryText, params);

    // 6. "Lapidando" os dados antes do envio final
    const pedidosFormatados = formatOrders(resultado.rows);
    res.json(pedidosFormatados);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao consultar o banco de dados" });
  }
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});

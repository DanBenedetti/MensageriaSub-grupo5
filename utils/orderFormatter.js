function formatOrders(rows) {
  const ordersMap = new Map();

  rows.forEach(row => {
    // 1. Verifica se o pedido já existe no mapa, se não, cria a estrutura base
    if (!ordersMap.has(row.uuid)) {
      ordersMap.set(row.uuid, {
        uuid: row.uuid,
        created_at: row.created_at,
        status: row.status,
        customer: {
          id: row.customer_id,
          name: row.customer_name,
          email: row.customer_email
        },
        items: [],
        total_order: 0
      });
    }

    const currentOrder = ordersMap.get(row.uuid);

    // 2. Cálculo dinâmico do total do item (Quantidade x Preço Unitário)
    const quantity = parseFloat(row.quantidade) || 0;
    const unitPrice = parseFloat(row.preco_unitario_no_momento) || 0;
    const totalItem = quantity * unitPrice;

    // 3. Adiciona o item à lista do pedido
    currentOrder.items.push({
      product_id: row.product_id,
      product_name: row.product_name,
      quantity: quantity,
      unit_price: unitPrice,
      total_item: parseFloat(totalItem.toFixed(2))
    });

    // 4. Soma ao total final do pedido
    currentOrder.total_order = parseFloat((currentOrder.total_order + totalItem).toFixed(2));
  });

  // Retorna o array de pedidos formatados
  return Array.from(ordersMap.values());
}

module.exports = { formatOrders };

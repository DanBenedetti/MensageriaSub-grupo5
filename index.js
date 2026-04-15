const { PubSub } = require('@google-cloud/pubsub');
const path = require('path');
const db = require('./BD/database'); // <-- Importando o módulo de banco de dados do Passo 1

// Configura o caminho da chave JSON
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'key-grupo5.json');

const subscriptionNameOrId = 'projects/serjava-demo/subscriptions/sub-grupo5';

const pubSubClient = new PubSub();

function listenForMessages() {
  const subscription = pubSubClient.subscription(subscriptionNameOrId);

  // A função agora é 'async' para podermos aguardar (await) as inserções no banco
  const messageHandler = async (message) => {
    console.log(`\nRecebido ID da Mensagem: ${message.id}`);
    
    try {
      // 1. Faz o parse da mensagem que chega como Buffer para um objeto JavaScript
      const payload = JSON.parse(message.data.toString());
      console.log(`Processando pedido UUID: ${payload.uuid}`);

      // 2. Persistir Cliente
      // ON CONFLICT evita erro caso esse cliente já tenha comprado antes
      const queryCliente = `
        INSERT INTO clientes (id, nome, email, documento) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `;
      await db.query(queryCliente, [
        payload.customer.id, 
        payload.customer.name, 
        payload.customer.email, 
        payload.customer.document || 'N/A' // Garantia caso o documento venha vazio
      ]);

      // 3. Persistir Pedido
      // Tentamos pegar a data de 'created at' ou 'created_at'. 
      // Se não houver nenhuma, usamos a data atual para não falhar a restrição NOT NULL.
      const dataCriacao = payload['created at'] || payload['created_at'] || new Date();

      const queryPedido = `
        INSERT INTO pedidos (
          uuid, cliente_id, canal, status, data_criacao_payload, 
          vendedor_nome, vendedor_id, vendedor_cidade, vendedor_estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (uuid) DO NOTHING;
      `;
      await db.query(queryPedido, [
        payload.uuid,
        payload.customer.id,
        payload.channel,
        payload.status,
        dataCriacao, 
        payload.seller.name,
        payload.seller.id,
        payload.seller.city,
        payload.seller.state
      ]);

      // 4. Persistir Produtos e Itens do Pedido
      if (payload.items && payload.items.length > 0) {
        for (const item of payload.items) {
          
          // Extraindo a subcategoria do array, se existir
          const subCategoria = item.category && item.category.sub_category && item.category.sub_category.length > 0 
            ? item.category.sub_category[0].name 
            : null;

          // Insere o Produto no catálogo (ignora se já existir)
          const queryProduto = `
            INSERT INTO produtos (id, nome, preco_unitario, categoria, sub_categoria)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING;
          `;
          await db.query(queryProduto, [
            item.product_id,
            item.product_name,
            item.unit_price,
            item.category ? item.category.name : null,
            subCategoria
          ]);

          // Insere o Item atrelado ao Pedido atual
          const queryItemPedido = `
            INSERT INTO itens_pedido (pedido_uuid, produto_id, quantidade, preco_unitario_no_momento)
            VALUES ($1, $2, $3, $4);
          `;
          await db.query(queryItemPedido, [
            payload.uuid,
            item.product_id,
            item.quantity,
            item.unit_price
          ]);
        }
      }

      console.log(`✅ Pedido ${payload.uuid} salvo no banco com sucesso!`);
      
      // 5. Confirma o recebimento da mensagem (Acknowledge) SOMENTE se tudo deu certo
      message.ack();

    } catch (error) {
      console.error(`❌ Erro ao processar a mensagem no banco: ${error.message}`);
      // Em caso de falha no banco, devolvemos a mensagem (NACK) para o Pub/Sub tentar depois
      message.nack(); 
    }
  };

  const errorHandler = error => {
    console.error(`Erro na assinatura: ${error.message}`);
  };

  subscription.on('message', messageHandler);
  subscription.on('error', errorHandler);

  console.log(`Ouvindo mensagens na assinatura: ${subscriptionNameOrId}...`);
}

listenForMessages();
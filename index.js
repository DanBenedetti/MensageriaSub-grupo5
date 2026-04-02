const { PubSub } = require('@google-cloud/pubsub');
const path = require('path');

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'key-grupo5.json');

const subscriptionNameOrId = 'projects/serjava-demo/subscriptions/sub-grupo5';

const pubSubClient = new PubSub();

function listenForMessages() {
  const subscription = pubSubClient.subscription(subscriptionNameOrId);


  const messageHandler = message => {
    console.log(`Recebido ID: ${message.id}`);
    console.log(`Mensagem: ${message.data.toString()}`);
    
    message.ack();
  };


  const errorHandler = error => {
    console.error(`Erro: ${error.message}`);
  };


  subscription.on('message', messageHandler);
  subscription.on('error', errorHandler);

  console.log(`Ouvindo mensagens na assinatura: ${subscriptionNameOrId}...`);
}

listenForMessages();

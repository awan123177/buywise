import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data_store.json', 'utf8'));

data.telegramConfig = {
  channelUsername: "@buywiseofficial",
  botToken: "8654463361:AAG1zaFwPSn6EgRupkTAMROdQcnzg3CCMU8b",
  enabled: true
};

fs.writeFileSync('./data_store.json', JSON.stringify(data, null, 2));
console.log('Updated telegramConfig in data_store.json');

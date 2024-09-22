import { Client } from "@upstash/qstash";

const { QSTASH_TOKEN, BASE_URL, RTR_URL } = process.env;

const client = new Client({ token: QSTASH_TOKEN });
const queue = client.queue({ queueName: "casbytes" });

(async () => {
  await queue.upsert({ parallelism: 1 });
})();

async function publish(body: object) {
  return queue.enqueueJSON({
    body,
    url: RTR_URL,
    callback: `${BASE_URL}/qstash/callback`,
    failureCallback: `${BASE_URL}/qstash/failure/callback`,
  });
}

export class QStash {
  static publish = publish;
}

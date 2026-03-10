type SSEClient = {
  id: string;
  res: import("express").Response;
};

const clients = new Map<string, SSEClient>();

export function subscribe(id: string, res: import("express").Response) {
  clients.set(id, { id, res });
}

export function unsubscribe(id: string) {
  const c = clients.get(id);
  if (c) {
    try {
      c.res.end();
    } catch {}
    clients.delete(id);
  }
}

export function publish(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const [, client] of clients) {
    try {
      client.res.write(payload);
    } catch (err) {
      // ignore write errors
    }
  }
}

export function clientCount() {
  return clients.size;
}

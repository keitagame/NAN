import { useEffect, useState } from "react";
import { getConnections } from "./nostr/relayPool";

export default function Feed() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const sub = getConnections((ev) => {
      setEvents((prev) => [ev, ...prev]);
    });

    return () => {
      sub.close();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {events.map((ev) => (
        <div key={ev.id} style={{ marginBottom: 10 }}>
          {ev.content}
        </div>
      ))}
    </div>
  );
}

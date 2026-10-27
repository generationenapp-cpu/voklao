import { useHashRoute } from "./lib/router";
import { decodeShared, getAgent } from "./lib/agents";
import Home from "./components/Home";
import Builder from "./components/Builder";
import ChatPage from "./components/ChatPage";

export default function App() {
  const [page, param] = useHashRoute();

  if (page === "edit" && param) {
    const agent = getAgent(param);
    if (agent) return <Builder key={agent.id} initial={agent} />;
  }
  if (page === "chat" && param) {
    const agent = getAgent(param);
    if (agent) return <ChatPage agent={agent} ownerId={agent.id} />;
  }
  if (page === "s" && param) {
    const agent = decodeShared(param);
    if (agent) return <ChatPage agent={agent} shared />;
    return <Home notice="Linket virker ikke. Det er måske blevet klippet over." />;
  }
  return <Home />;
}

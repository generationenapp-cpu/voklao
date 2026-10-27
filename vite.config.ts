import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Lets `npm run dev` serve the /api functions locally, the same way Vercel does in production.
function localApi(): Plugin {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)/);
        if (!match || req.method !== "POST") return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const request = new Request(`http://localhost${req.url}`, {
            method: "POST",
            headers: req.headers as Record<string, string>,
            body: Buffer.concat(chunks),
          });
          const response: Response = await mod.POST(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          if (response.body) {
            for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
          }
          res.end();
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));
  return { plugins: [react(), tailwindcss(), localApi()] };
});

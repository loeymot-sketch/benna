# EL BENNA LAB OS — image unique (API + site compilé). SQLite + pièces jointes sur le volume /data.
FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY api/package*.json api/
COPY web/package*.json web/
RUN cd api && npm ci --no-audit --no-fund && cd ../web && npm ci --no-audit --no-fund

COPY api api
COPY web web
RUN cd api && npx prisma generate && cd ../web && npm run build

ENV NODE_ENV=production \
    PORT=8787 \
    DATABASE_URL=file:/data/prod.db \
    UPLOAD_DIR=/data/uploads
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Au démarrage : base créée/mise à jour (sans perte), comptes créés s'ils n'existent pas, puis serveur.
WORKDIR /app/api
CMD ["sh", "-c", "mkdir -p /data/uploads && npx prisma db push --skip-generate && npx tsx prisma/seed-real.ts && exec npx tsx src/index.ts"]

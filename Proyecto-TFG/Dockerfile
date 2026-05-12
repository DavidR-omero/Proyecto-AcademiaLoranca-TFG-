FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend/ ./backend/
COPY ./*.html ./ 
COPY ./imagenes/ ./imagenes/
COPY ./parte-css/ ./parte-css/
COPY ./parte-logica/ ./parte-logica/
COPY ./admin/ ./admin/

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "server.js"]
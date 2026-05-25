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

ENV SMTP_HOST=smtp.gmail.com
ENV SMTP_PORT=587
ENV SMTP_USER=proyectoacademiatfg@gmail.com
ENV SMTP_PASS=
ENV FROM_ADDR="Academia Loranca <proyectoacademiatfg@gmail.com>"

WORKDIR /app/backend
CMD ["node", "server.js"]
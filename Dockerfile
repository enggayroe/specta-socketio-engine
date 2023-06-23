# Base image yang digunakan
FROM node:16.13.2-alpine

# Set working directory dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Menginstall dependencies
RUN npm install

# Menyalin seluruh kode sumber aplikasi ke dalam container
COPY . .

# Menjalankan perintah build aplikasi
RUN npm run build

# Port yang akan diexpose oleh container
EXPOSE 3000

# Perintah untuk menjalankan aplikasi saat container berjalan
CMD [ "npm", "run", "start:prod" ]
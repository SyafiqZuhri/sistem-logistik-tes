const express = require('express');
const redis = require('redis');
const app = express();

// Middleware
app.use(express.json());
// INI KODE BARUNYA: Menyuruh server menampilkan folder "public" sebagai halaman web
app.use(express.static('public')); 

const client = redis.createClient({ url: 'redis://database-redis:6379' });
client.on('error', (err) => console.log('Menunggu Database...', err));

async function startApp() {
    try {
        await client.connect();
        console.log('Database Logistik Terhubung!');
    } catch (err) {
        console.error('Gagal koneksi ke database');
    }

    app.post('/resi', async (req, res) => {
        const { no_resi, pengirim, penerima } = req.body;
        const dataPaket = {
            no_resi, pengirim, penerima,
            status: "Paket Diterima di Hub Origin",
            waktu_update: new Date().toISOString()
        };
        await client.set(no_resi, JSON.stringify(dataPaket));
        res.status(201).json({ message: "Resi berhasil dibuat!", data: dataPaket });
    });

    app.put('/resi/:id', async (req, res) => {
        const resi = req.params.id;
        const { status_baru } = req.body;
        let paket = await client.get(resi);
        if (!paket) return res.status(404).json({ error: "Resi tidak ditemukan!" });
        
        paket = JSON.parse(paket);
        paket.status = status_baru;
        paket.waktu_update = new Date().toISOString();
        
        await client.set(resi, JSON.stringify(paket));
        res.json({ message: "Status paket diperbarui!", data: paket });
    });

    app.get('/resi/:id', async (req, res) => {
        const resi = req.params.id;
        let paket = await client.get(resi);
        if (!paket) return res.status(404).json({ error: "Resi tidak ditemukan!" });
        res.json(JSON.parse(paket));
    });

    app.listen(8080, '0.0.0.0', () => console.log('Server Web & API Logistik Menyala!'));
}
startApp();

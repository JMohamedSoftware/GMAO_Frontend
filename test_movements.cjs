const axios = require('axios');
const API_URL = 'https://gmao-backend-a6r2.onrender.com/api';

async function test() {
    try {
        const loginRes = await axios.post(`${API_URL}/Auth/login`, {
            email: 'admin@gmao.com',
            password: 'password'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        
        const partsRes = await axios.get(`${API_URL}/Pieces`, { headers });
        console.log("Parts:", partsRes.data.length);
        
        if (partsRes.data.length > 0) {
            const part = partsRes.data[0];
            console.log("Trying to PUT part", part.id);
            const putRes = await axios.put(`${API_URL}/Pieces/${part.id}`, part, { headers });
            console.log("PUT status:", putRes.status);
            
            console.log("Trying to POST movement");
            const movRes = await axios.post(`${API_URL}/MouvementsStock`, {
                pieceId: part.id,
                userId: 1,
                type: 1,
                quantite: 5,
                prixUnitaire: 0,
                prixTotal: 0,
                motif: 'Test'
            }, { headers });
            console.log("POST mov status:", movRes.status);
        }
    } catch (e) {
        console.error("ERROR:", e.response ? e.response.status + " " + JSON.stringify(e.response.data) : e.message);
    }
}
test();

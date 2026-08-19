import pg from "pg";
const client = new pg.Client({ connectionString: process.env.DIRECT_URL });
await client.connect();

const part = await client.query(`SELECT id_participante, nome, email, role FROM participante ORDER BY id_participante;`);
console.log("Participantes:", part.rows);

const r = await client.query(`
  SELECT p.id_presenca, p.id_participante, p.id_sessao, p.registrado_em, s.nome
  FROM presenca p
  JOIN sessao s ON s.id_sessao = p.id_sessao
  JOIN participante part ON part.id_participante = p.id_participante
  WHERE part.email = 'ana.souza@evento.com'
  ORDER BY p.id_presenca;
`);
console.log("Presenças da Ana:", r.rows);

await client.end();

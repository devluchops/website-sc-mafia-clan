/**
 * Reemplaza clan_rules con el contenido del documento oficial
 * "CLAN MAFIA — Principios y Reglas".
 * Uso: node scripts/seed-official-rules.js
 */
const fs = require("fs");
const { neon } = require("@neondatabase/serverless");

for (const l of fs.readFileSync(".env.local", "utf8").split("\n")) {
  const m = l.match(/^DATABASE_URL=(.*)$/);
  if (m) process.env.DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, "");
}
const sql = neon(process.env.DATABASE_URL);

const RULES = [
  // Principios y Reglas
  ["Principios y Reglas", "Lealtad y Confianza", "Se espera compromiso y honestidad con el equipo. Si un miembro actúa en contra del grupo (como filtrar estrategias o generar toxicidad intencionada), perderá la confianza y su permanencia será evaluada."],
  ["Principios y Reglas", "Respeto", "La línea del respeto no se cruza. No se toleran insultos, discriminación ni faltas de respeto hacia compañeros o rivales."],
  ["Principios y Reglas", "Apoyo Mutuo", "El clan se ayuda a subir de nivel, compartir recursos o enseñar a quienes están aprendiendo."],
  ["Principios y Reglas", "Uso de Identificación (Tag)", "Es obligatorio usar el Tag del clan en el nombre dentro del juego."],
  ["Principios y Reglas", "Fair Play y Prohibición de Trampas", "Queda estrictamente prohibido el uso de hacks, smurfing, suplantar la identidad de otro miembro o prestar cuentas a terceros para jugar."],
  ["Principios y Reglas", "Sanción", "Expulsión inmediata e irrevocable del clan."],
  // Organigrama
  ["Organigrama", "Líder / Fundador", "Toma las decisiones finales, coordina el rumbo del clan y representa al grupo."],
  ["Organigrama", "Socio", "Provee sustentabilidad económica al clan para participar en torneos de pago y aporta a premios de torneos internos. Participa en la toma de decisiones del clan y contribuye a la caja chica."],
  ["Organigrama", "Co-Líderes / Oficiales", "Administran los canales de comunicación, organizan eventos/torneos internos y supervisan el cumplimiento de las reglas."],
  ["Organigrama", "Capitanes de Juego", "Encargados de las estrategias y alineaciones para partidas competitivas y entrenamientos."],
  ["Organigrama", "Miembros", "Jugadores activos que participan en eventos, respetan las normas y apoyan al equipo."],
  // Sistema de Sanciones
  ["Sistema de Sanciones", "Falta Leve", "No usar tag o inactividad breve sin aviso → Advertencia verbal o escrita."],
  ["Sistema de Sanciones", "Falta Grave", "Faltas de respeto o discusiones destructivas → Suspensión temporal de partidas oficiales o eventos del clan (el tiempo lo determina el Líder)."],
  ["Sistema de Sanciones", "Falta Muy Grave", "Uso de trampas, suplantación o traición al clan → Expulsión definitiva sin derecho a reingreso."],
  ["Sistema de Sanciones", "Reincidencia", "La continuidad de faltas graves y leves será motivo de expulsión."],
];

(async () => {
  await sql`DELETE FROM clan_rules`;
  let i = 0;
  for (const [category, title, description] of RULES) {
    i++;
    await sql`
      INSERT INTO clan_rules (category, title, description, order_index)
      VALUES (${category}, ${title}, ${description}, ${i})
    `;
  }
  console.log(`clan_rules reemplazado: ${RULES.length} reglas oficiales cargadas.`);
})().catch((e) => { console.error(e); process.exit(1); });

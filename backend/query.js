import sql from './config/db.js';

async function run() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos'
    `;
    console.log("Columns:", columns);

    // If valor_pedido doesn't exist, we add it.
    const hasValorPedido = columns.some(c => c.column_name === 'valor_pedido');
    if (!hasValorPedido) {
      console.log("Adding valor_pedido column to pedidos...");
      await sql`ALTER TABLE pedidos ADD COLUMN valor_pedido NUMERIC(15,2) DEFAULT 0`;
      console.log("Column added.");
    }

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();

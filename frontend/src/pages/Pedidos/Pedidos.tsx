import PedidosCard from '../../components/pedidosCard/PedidosCard';
import styles from './Pedidos.module.scss';

const clientes = [
  {
    id: '1',
    tx_nomefantasia: 'Farmácia FARCURA',
    tx_razaosocial: 'FARCURA LTDA',
  },
  {
    id: '2',
    tx_nomefantasia: 'Perfumaria PERCURA',
    tx_razaosocial: 'PERCURA DISTRIBUIDORA',
  },
  {
    id: '3',
    tx_nomefantasia: 'Farmácia FARMEXE',
    tx_razaosocial: 'FARMEXE DROGARIAS',
  },
];

const vendedores = [
  { id: '10', tx_nome: 'ADAM SMITH' },
  { id: '11', tx_nome: 'BENJAMIN FRANKLIN' },
];

const pedidos = [
  {
    id: '1001',
    Cliente_id: '1',
    Vendedor_id: '10',
    pedido: 'PV-00215',
    dt_datapedido: '2026-04-20',
  },
  {
    id: '1002',
    Cliente_id: '2',
    Vendedor_id: '11',
    pedido: 'PV-00216',
    dt_datapedido: '2026-04-22',
  },
  {
    id: '1003',
    Cliente_id: '3',
    Vendedor_id: '10',
    pedido: 'PV-00217',
    dt_datapedido: '2026-04-23',
  },
  {
    id: '1004',
    Cliente_id: '1',
    Vendedor_id: '11',
    pedido: 'PV-00218',
    dt_datapedido: '2026-04-24',
  },
  {
    id: '1005',
    Cliente_id: '2',
    Vendedor_id: '10',
    pedido: 'PV-00219',
    dt_datapedido: '2026-04-25',
  },
  {
    id: '1006',
    Cliente_id: '3',
    Vendedor_id: '11',
    pedido: 'PV-00220',
    dt_datapedido: '2026-04-26',
  },
  {
    id: '1007',
    Cliente_id: '1',
    Vendedor_id: '10',
    pedido: 'PV-00221',
    dt_datapedido: '2026-04-27',
  },
  {
    id: '1008',
    Cliente_id: '2',
    Vendedor_id: '11',
    pedido: 'PV-00222',
    dt_datapedido: '2026-04-28',
  },
];

const itensPedido = [
  {
    id: '501',
    Pedido_id: '1001',
    Produto_id: '200',
    nr_quantidade: 150,
  },
  {
    id: '502',
    Pedido_id: '1002',
    Produto_id: '115',
    nr_quantidade: 1000,
  },
  {
    id: '503',
    Pedido_id: '1003',
    Produto_id: '140',
    nr_quantidade: 500,
  },
  {
    id: '504',
    Pedido_id: '1004',
    Produto_id: '125',
    nr_quantidade: 300,
  },
  {
    id: '505',
    Pedido_id: '1005',
    Produto_id: '130',
    nr_quantidade: 150,
  },
  {
    id: '506',
    Pedido_id: '1006',
    Produto_id: '150',
    nr_quantidade: 450,
  },
  {
    id: '507',
    Pedido_id: '1007',
    Produto_id: '160',
    nr_quantidade: 200,
  },
  {
    id: '508',
    Pedido_id: '1008',
    Produto_id: '170',
    nr_quantidade: 600,
  },
];

const produtos = [
  {
    id: '115',
    codigo: '115',
    tx_descrição: 'Perfume SOHODOR 100 ml feminino',
    custoUnitario: 57.5,
  },
  {
    id: '125',
    codigo: '125',
    tx_descrição: 'Perfume SOLAVANDO 100 ml feminino',
    custoUnitario: 62.5,
  },
  {
    id: '130',
    codigo: '130',
    tx_descrição: 'Perfume SONAREZA 100 ml masculino',
    custoUnitario: 65.0,
  },
  {
    id: '140',
    codigo: '140',
    tx_descrição: 'Perfume SONOAR 100 ml masculino',
    custoUnitario: 70.0,
  },
  {
    id: '150',
    codigo: '150',
    tx_descrição: 'Perfume SOFRENCIA 100 ml masculino',
    custoUnitario: 75.0,
  },
  {
    id: '160',
    codigo: '160',
    tx_descrição: 'Perfume SOSENTE 100 ml masculino',
    custoUnitario: 80.0,
  },
  {
    id: '170',
    codigo: '170',
    tx_descrição: 'Perfume SOREZANDO 100 ml masculino',
    custoUnitario: 85.0,
  },
  {
    id: '200',
    codigo: '200',
    tx_descrição: 'Perfume SOXERO 50 ml masculino',
    custoUnitario: 100.0,
  },
];

export default function Pedidos() {
  return (
    <>
      <section className={styles.headerPedidos}>
        <div>
          <h1>Pedidos Recebidos</h1>
          <p>
            Monitoramento de ordens de saída enviadas pelo sistema de vendas
          </p>
        </div>
      </section>

      <section className={styles.containerCards}>
        <div className={styles.gridCards}>
          {itensPedido.map((item) => {
            const pedidoPai = pedidos.find((p) => p.id === item.Pedido_id);

            const produtoCorrespondente = produtos.find(
              (p) => p.id === item.Produto_id
            );

            const clienteCorrespondente = clientes.find(
              (c) => c.id === pedidoPai?.Cliente_id
            );

            const vendedorCorrespondente = vendedores.find(
              (v) => v.id === pedidoPai?.Vendedor_id
            );

            return (
              <PedidosCard
                key={item.id}
                id={item.id}
                numeroPedido={pedidoPai?.pedido ?? 'N/A'}
                data={pedidoPai?.dt_datapedido ?? '00/00/0000'}
                cliente={
                  clienteCorrespondente?.tx_nomefantasia ??
                  'Cliente não encontrado'
                }
                nomeProduto={
                  produtoCorrespondente?.tx_descrição ??
                  'Produto não identificado'
                }
                quantidade={item.nr_quantidade}
                vendedor={vendedorCorrespondente?.tx_nome ?? 'Sistema'}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}

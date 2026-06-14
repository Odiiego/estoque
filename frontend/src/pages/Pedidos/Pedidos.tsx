import { useEffect, useMemo, useState } from 'react';
import PedidosCard from '../../components/pedidosCard/PedidosCard';
import Paginacao from '../../components/paginacao/Paginacao';
import { usePaginacao } from '../../hooks/usePaginacao';
import styles from './Pedidos.module.scss';

// ─── Types da API ─────────────────────────────────────────────────────────────

type Cliente = {
  id: number;
  txRazaosocial: string;
  txNomefantasia: string;
  txCnpj: string;
  txTelefone: string;
  txEmail: string;
  txEndereco: string;
  txCidade: string;
  txEstado: string;
  flIsenable: boolean;
};

type Vendedor = {
  id: number;
  txNome: string;
  txCpf: string;
  txTelefone: string;
  txEmail: string;
  dtAdmissao: string;
  flIsenable: boolean;
};

type Pedido = {
  id: number;
  clienteId: number;
  vendedorId: number;
  nrPedido: string;
  dtDatapedido: string;
  nrValorbruto: number;
  nrValordesconto: number;
  nrValorliquido: number;
  flIsenable: boolean;
};

type ItemPedido = {
  id: number;
  pedidoId: number;
  produtoId: number;
  nrQuantidade: number;
  nrPrecounitario: number;
  nrDescontounitario: number;
  nrSubtotal: number;
  flIsenable: boolean;
};

type Produto = {
  id: number;
  txDescricao: string;
  txUnidade: string;
  nrPrecocusto: number;
  nrPrecovenda: number;
  nrEstoqueatual: number;
  nrEstoqueminimo: number;
  flIsenable: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = 'http://localhost:5125/api';
const HEADERS = { accept: 'application/json' };

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return <div className={styles.skeleton_card} />;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Pedidos() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          resClientes,
          resVendedores,
          resPedidos,
          resItens,
          resProdutos,
        ] = await Promise.all([
          fetch(`${API}/Clientes`, { headers: HEADERS }),
          fetch(`${API}/Vendedores`, { headers: HEADERS }),
          fetch(`${API}/Pedidos`, { headers: HEADERS }),
          fetch(`${API}/ItensPedido`, { headers: HEADERS }),
          fetch(`${API}/Produtos`, { headers: HEADERS }),
        ]);

        const [
          dataClientes,
          dataVendedores,
          dataPedidos,
          dataItens,
          dataProdutos,
        ] = await Promise.all([
          resClientes.json(),
          resVendedores.json(),
          resPedidos.json(),
          resItens.json(),
          resProdutos.json(),
        ]);

        setClientes(dataClientes);
        setVendedores(dataVendedores);
        setPedidos(dataPedidos);
        setItensPedido(dataItens);
        setProdutos(dataProdutos);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // ─── Dados derivados ─────────────────────────────────────────────────────────

  // Cruza item → pedido → cliente → vendedor → produto
  const cards = useMemo(() => {
    return itensPedido.map((item) => {
      const pedido = pedidos.find((p) => p.id === item.pedidoId);
      const cliente = clientes.find((c) => c.id === pedido?.clienteId);
      const vendedor = vendedores.find((v) => v.id === pedido?.vendedorId);
      const produto = produtos.find((p) => p.id === item.produtoId);

      return {
        key: item.id,
        id: String(item.id),
        numeroPedido: pedido?.nrPedido ?? 'N/A',
        data: pedido?.dtDatapedido ?? '',
        cliente: cliente?.txNomefantasia ?? 'Cliente não encontrado',
        nomeProduto: produto?.txDescricao ?? 'Produto não identificado',
        quantidade: item.nrQuantidade,
        vendedor: vendedor?.txNome ?? 'Sistema',
      };
    });
  }, [itensPedido, pedidos, clientes, vendedores, produtos]);

  // ─── Paginação ───────────────────────────────────────────────────────────────

  const pag = usePaginacao(cards);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <section className={styles.headerPedidos}>
        <div>
          <h1>Pedidos Recebidos</h1>
          <p>Monitoramento de ordens de saída enviadas pelo sistema de vendas</p>
        </div>
      </section>

      <section className={styles.containerCards}>
        <div className={styles.gridCards}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : pag.itensPagina.map((card) => (
                <PedidosCard
                  key={card.key}
                  id={card.id}
                  numeroPedido={card.numeroPedido}
                  data={card.data}
                  cliente={card.cliente}
                  nomeProduto={card.nomeProduto}
                  quantidade={card.quantidade}
                  vendedor={card.vendedor}
                />
              ))}
        </div>

        {!loading && (
          <Paginacao
            paginaAtual={pag.paginaAtual}
            totalPaginas={pag.totalPaginas}
            total={cards.length}
            irPara={pag.irPara}
          />
        )}
      </section>
    </>
  );
}

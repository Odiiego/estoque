import { useEffect, useState } from 'react';
import PedidosCard from '../../components/pedidosCard/PedidosCard';
import styles from './Pedidos.module.scss';

type Cliente = {
  id: string;
  tx_nomefantasia: string;
};

type Vendedor = {
  id: string;
  tx_nome: string;
};

type Pedido = {
  id: string;
  Cliente_id: string;
  Vendedor_id: string;
  pedido: string;
  dt_datapedido: string;
};

type ItemPedido = {
  id: string;
  Pedido_id: string;
  Produto_id: string;
  nr_quantidade: number;
};

type Produto = {
  id: string;
  tx_descrição: string;
};

const API_URL = 'https://sofragrancia-api-0qg4.onrender.com';

export default function Pedidos() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  // Busca todos os dados necessários da API
  useEffect(() => {
    fetch(`${API_URL}/clientes`)
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => console.error('Erro ao buscar clientes:', err));

    fetch(`${API_URL}/vendedores`)
      .then((res) => res.json())
      .then((data) => setVendedores(data))
      .catch((err) => console.error('Erro ao buscar vendedores:', err));

    fetch(`${API_URL}/pedidos`)
      .then((res) => res.json())
      .then((data) => setPedidos(data))
      .catch((err) => console.error('Erro ao buscar pedidos:', err));

    fetch(`${API_URL}/itensPedido`)
      .then((res) => res.json())
      .then((data) => setItensPedido(data))
      .catch((err) => console.error('Erro ao buscar itens do pedido:', err));

    fetch(`${API_URL}/produtos`)
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error('Erro ao buscar produtos:', err));
  }, []);

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
            const vendedoreCorrespondente = vendedores.find(
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
                vendedor={vendedoreCorrespondente?.tx_nome ?? 'Sistema'}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}

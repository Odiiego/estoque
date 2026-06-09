import { Plus, X, Trash2 } from 'lucide-react';
import styles from './Reposicao.module.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type Fornecedor = {
  id: string;
  nome: string;
};

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  fornecedorId: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  loteEconomico: number;
  custoUnitario: number;
};

type ItemPedidoInput = {
  produtoId: string;
  quantidade: number;
};

type PedidoReposicao = {
  id: string;
  fornecedorId: string;
  data: string;
  tipo: 'Automático' | 'Manual';
  status: 'Realizado' | 'Processando';
  itens: ItemPedidoInput[];
};

type ItemForm = {
  _key: string;
  produtoId: string;
  quantidade: number;
};

type PedidoForm = {
  fornecedor: string;
  data: string;
};

const API_URL = 'https://sofragrancia-api-0qg4.onrender.com';

export default function Reposicao() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoReposicao[]>([]);
  const [pedidoFiltro, setPedidoFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [formItens, setFormItens] = useState<ItemForm[]>([]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PedidoForm>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  });

  // Busca de Dados
  const carregarDados = () => {
    fetch(`${API_URL}/fornecedores`)
      .then((res) => res.json())
      .then((data) => setFornecedores(data))
      .catch((err) => console.error('Erro ao buscar fornecedores:', err));

    fetch(`${API_URL}/produtos`)
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error('Erro ao buscar produtos:', err));

    fetch(`${API_URL}/pedidosReposicao`)
      .then((res) => res.json())
      .then((data) => setPedidos(data))
      .catch((err) =>
        console.error('Erro ao buscar pedidos de reposição:', err)
      );
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Gerenciadores de Linha Dinâmica do Formulário
  const adicionarLinha = () => {
    setFormItens((prev) => [
      ...prev,
      { _key: crypto.randomUUID(), produtoId: '', quantidade: 0 },
    ]);
  };

  const removerLinha = (key: string) => {
    setFormItens((prev) => prev.filter((i) => i._key !== key));
  };

  const atualizarLinha = (
    key: string,
    campo: 'produtoId' | 'quantidade',
    valor: string | number
  ) => {
    setFormItens((prev) =>
      prev.map((i) => (i._key === key ? { ...i, [campo]: valor } : i))
    );
  };

  const fecharModal = () => {
    reset();
    setFormItens([]);
    dialogRef.current?.close();
  };

  // Envio do formulário com POST HTTP
  const onSubmit = (data: PedidoForm) => {
    if (
      formItens.length === 0 ||
      formItens.some((i) => !i.produtoId || i.quantidade <= 0)
    )
      return;

    const novoPedido = {
      id: `MAN-${Math.floor(1000 + Math.random() * 9000)}-${data.fornecedor}`,
      fornecedorId: data.fornecedor,
      data: data.data,
      tipo: 'Manual',
      status: 'Processando',
      itens: formItens.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
      })),
    };

    fetch(`${API_URL}/pedidosReposicao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoPedido),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao registrar pedido');
        return res.json();
      })
      .then(() => {
        carregarDados(); // Recarrega os dados para sincronizar a tabela
        fecharModal();
      })
      .catch((err) => console.error('Erro ao registrar novo pedido:', err));
  };

  const produtosAbaixoMinimo = useMemo(
    () => produtos.filter((p) => p.estoqueAtual < p.estoqueMinimo),
    [produtos]
  );

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const fornecedor = fornecedores.find((f) => f.id === pedido.fornecedorId);

      const matchBusca =
        pedidoFiltro === '' ||
        pedido.id.toLowerCase().includes(pedidoFiltro.toLowerCase()) ||
        fornecedor?.nome.toLowerCase().includes(pedidoFiltro.toLowerCase());

      const matchTipo = tipoFiltro === '' || pedido.tipo === tipoFiltro;
      const matchStatus = statusFiltro === '' || pedido.status === statusFiltro;

      return matchBusca && matchTipo && matchStatus;
    });
  }, [pedidos, fornecedores, pedidoFiltro, tipoFiltro, statusFiltro]);

  const formatarMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalForm = useMemo(() => {
    return formItens.reduce((acc, item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      return acc + (produto?.custoUnitario ?? 0) * (item.quantidade || 0);
    }, 0);
  }, [formItens, produtos]);

  return (
    <>
      <section className={styles.header}>
        <div>
          <h1>Reposição de Estoque</h1>
          <p>Gerencie pedidos de reposição automáticos e manuais</p>
        </div>
        <button onClick={() => dialogRef.current?.showModal()}>
          <Plus strokeWidth={4} size={22} />
          Novo Pedido
        </button>
      </section>

      {/* Alertas de reposição crítica */}
      {produtosAbaixoMinimo.length > 0 && (
        <section className={styles.table_container}>
          <div className={styles.table_header}>
            <h2>⚠️ Produtos Abaixo do Mínimo</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className='pseudo-title'>Código</th>
                <th className='pseudo-title'>Produto</th>
                <th className='pseudo-title'>Estoque Atual</th>
                <th className='pseudo-title'>Estoque Mínimo</th>
                <th className='pseudo-title'>Fornecedor</th>
                <th className='pseudo-title'>Lote Econômico</th>
              </tr>
            </thead>
            <tbody>
              {produtosAbaixoMinimo.map((produto) => (
                <tr className={styles.text_only} key={produto.id}>
                  <td>{produto.codigo}</td>
                  <td>{produto.nome}</td>
                  <td>
                    <span className={styles.ruptura}>
                      {produto.estoqueAtual} un
                    </span>
                  </td>
                  <td>{produto.estoqueMinimo} un</td>
                  <td>
                    {fornecedores.find((f) => f.id === produto.fornecedorId)
                      ?.nome ?? produto.fornecedorId}
                  </td>
                  <td>{produto.loteEconomico} un</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Modal de novo pedido */}
      <dialog ref={dialogRef} className={styles.modal}>
        <div className={styles.modal_header}>
          <h2>Novo Pedido de Compra</h2>
          <X size={20} className={styles.btn_close} onClick={fecharModal} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.modal_form}>
          <div className={styles.horizontal}>
            <label>
              Fornecedor
              <select
                {...register('fornecedor', {
                  required: 'Selecione um fornecedor',
                })}
                defaultValue=''
              >
                <option value='' disabled>
                  Selecione um fornecedor...
                </option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome} (Cód: {f.id})
                  </option>
                ))}
              </select>
              {errors.fornecedor && <span>{errors.fornecedor.message}</span>}
            </label>

            <label>
              Data
              <input
                type='date'
                {...register('data', { required: 'Informe a data' })}
              />
              {errors.data && <span>{errors.data.message}</span>}
            </label>
          </div>

          <div className={styles.itens_header}>
            <span>Itens do Pedido</span>
            <button
              type='button'
              className={styles.btn_add_linha}
              onClick={adicionarLinha}
            >
              <Plus size={14} strokeWidth={3} /> Adicionar produto
            </button>
          </div>

          <div className={styles.itens_lista}>
            {formItens.length === 0 && (
              <p className={styles.itens_vazio}>
                Nenhum produto adicionado ainda.
              </p>
            )}
            {formItens.map((item) => {
              const produtoSelecionado = produtos.find(
                (p) => p.id === item.produtoId
              );
              const subtotal =
                (produtoSelecionado?.custoUnitario ?? 0) *
                (item.quantidade || 0);

              return (
                <div key={item._key} className={styles.item_linha}>
                  <select
                    value={item.produtoId}
                    onChange={(e) =>
                      atualizarLinha(item._key, 'produtoId', e.target.value)
                    }
                  >
                    <option value='' disabled>
                      Selecione um produto...
                    </option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo} — {p.nome} (Estoque: {p.estoqueAtual} un)
                      </option>
                    ))}
                  </select>
                  <input
                    type='number'
                    placeholder='Qtd'
                    min={1}
                    value={item.quantidade || ''}
                    onChange={(e) =>
                      atualizarLinha(
                        item._key,
                        'quantidade',
                        Number(e.target.value)
                      )
                    }
                  />
                  <span className={styles.item_subtotal}>
                    {formatarMoeda(subtotal)}
                  </span>
                  <Trash2
                    size={16}
                    className={styles.btn_remover}
                    onClick={() => removerLinha(item._key)}
                  />
                </div>
              );
            })}
          </div>

          {formItens.length > 0 && (
            <div className={styles.itens_total}>
              Total: <strong>{formatarMoeda(totalForm)}</strong>
            </div>
          )}

          <div className={styles.modal_footer}>
            <button type='button' onClick={fecharModal}>
              Cancelar
            </button>
            <button type='submit'>Registrar Pedido</button>
          </div>
        </form>
      </dialog>

      {/* Tabela unificada de pedidos */}
      <section className={styles.table_container}>
        <div className={styles.table_header}>
          <h2>Pedidos de Reposição</h2>
          <div className={styles.filter_container_multiplerows}>
            <label>
              <input
                type='text'
                placeholder='Buscar pedido ou fornecedor...'
                value={pedidoFiltro}
                onChange={(e) => setPedidoFiltro(e.target.value)}
              />
            </label>
            <label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value=''>Todos os tipos</option>
                <option value='Automático'>Automático</option>
                <option value='Manual'>Manual</option>
              </select>
            </label>
            <label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value=''>Todos os status</option>
                <option value='Realizado'>Realizado</option>
                <option value='Processando'>Processando</option>
              </select>
            </label>
            <button
              type='button'
              onClick={() => {
                setPedidoFiltro('');
                setTipoFiltro('');
                setStatusFiltro('');
              }}
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className='pseudo-title'>Pedido</th>
              <th className='pseudo-title'>Fornecedor</th>
              <th className='pseudo-title'>Data</th>
              <th className='pseudo-title'>Tipo</th>
              <th className='pseudo-title'>Itens</th>
              <th className='pseudo-title'>Valor Total</th>
              <th className='pseudo-title'>Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => {
              const fornecedor = fornecedores.find(
                (f) => f.id === pedido.fornecedorId
              );
              const valorTotal = pedido.itens.reduce((acc, item) => {
                const produto = produtos.find((p) => p.id === item.produtoId);
                return acc + item.quantidade * (produto?.custoUnitario ?? 0);
              }, 0);

              return (
                <tr className={styles.text_only} key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{fornecedor?.nome ?? pedido.fornecedorId}</td>
                  <td>{pedido.data.split('-').reverse().join('/')}</td>
                  <td>
                    <span
                      className={
                        pedido.tipo === 'Automático'
                          ? styles.automatico
                          : styles.manual
                      }
                    ></span>
                  </td>
                  <td className={styles.td_itens}>
                    {pedido.itens.map((item) => {
                      const produto = produtos.find(
                        (p) => p.id === item.produtoId
                      );
                      return (
                        <div key={item.produtoId}>
                          {produto?.nome ?? item.produtoId} — {item.quantidade}{' '}
                          un
                        </div>
                      );
                    })}
                  </td>
                  <td>{formatarMoeda(valorTotal)}</td>
                  <td>
                    <span
                      className={
                        pedido.status === 'Realizado'
                          ? styles.realizado
                          : styles.processando
                      }
                    ></span>
                  </td>
                </tr>
              );
            })}
            {pedidosFiltrados.length === 0 && (
              <tr className={styles.text_only}>
                <td colSpan={7} className={styles.vazio}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

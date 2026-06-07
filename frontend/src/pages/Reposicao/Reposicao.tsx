import { Plus, X, Trash2 } from 'lucide-react';
import styles from './Reposicao.module.scss';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

const fornecedores = [
  { id: 'FM001', nome: 'FORNMASC LTDA' },
  { id: 'FF001', nome: 'FORNFEM LTDA' },
];

const produtos = [
  // Perfumes 100ml
  {
    id: '100',
    codigo: '100',
    nome: 'Perfume SOXERO 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 1100,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 45.0,
  },
  {
    id: '105',
    codigo: '105',
    nome: 'Perfume SOXERO 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1155,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 46.2,
  },
  {
    id: '110',
    codigo: '110',
    nome: 'Perfume SOHODOR 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 1210,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 47.4,
  },
  {
    id: '115',
    codigo: '115',
    nome: 'Perfume SOHODOR 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 0,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 48.6,
  },
  {
    id: '120',
    codigo: '120',
    nome: 'Perfume SOLAVANDO 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 1320,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 49.8,
  },
  {
    id: '125',
    codigo: '125',
    nome: 'Perfume SOLAVANDO 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1375,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 51.0,
  },
  {
    id: '130',
    codigo: '130',
    nome: 'Perfume SONAREZA 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 1430,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 52.2,
  },
  {
    id: '135',
    codigo: '135',
    nome: 'Perfume SONAREZA 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1485,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 53.4,
  },
  {
    id: '140',
    codigo: '140',
    nome: 'Perfume SONOAR 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 0,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 54.6,
  },
  {
    id: '145',
    codigo: '145',
    nome: 'Perfume SONOAR 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1595,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 55.8,
  },
  {
    id: '150',
    codigo: '150',
    nome: 'Perfume SOFRENCIA 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 1650,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 57.0,
  },
  {
    id: '155',
    codigo: '155',
    nome: 'Perfume SOFRENCIA 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 210,
    estoqueMinimo: 600,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 58.2,
  },
  {
    id: '160',
    codigo: '160',
    nome: 'Perfume SOSENTE 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 1760,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 59.4,
  },
  {
    id: '165',
    codigo: '165',
    nome: 'Perfume SOSENTE 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1815,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 60.6,
  },
  {
    id: '170',
    codigo: '170',
    nome: 'Perfume SOREZANDO 100ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 800,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 61.8,
  },
  {
    id: '175',
    codigo: '175',
    nome: 'Perfume SOREZANDO 100ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1925,
    estoqueMinimo: 500,
    pontoReposicao: 700,
    loteEconomico: 500,
    custoUnitario: 63.0,
  },
  // Perfumes 50ml
  {
    id: '200',
    codigo: '200',
    nome: 'Perfume SOXERO 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2200,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 64.2,
  },
  {
    id: '205',
    codigo: '205',
    nome: 'Perfume SOXERO 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 2255,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 65.4,
  },
  {
    id: '210',
    codigo: '210',
    nome: 'Perfume SOHODOR 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2310,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 66.6,
  },
  {
    id: '215',
    codigo: '215',
    nome: 'Perfume SOHODOR 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 2365,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 67.8,
  },
  {
    id: '220',
    codigo: '220',
    nome: 'Perfume SOLAVANDO 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2420,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 69.0,
  },
  {
    id: '225',
    codigo: '225',
    nome: 'Perfume SOLAVANDO 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 900,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 70.2,
  },
  {
    id: '230',
    codigo: '230',
    nome: 'Perfume SONAREZA 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2530,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 71.4,
  },
  {
    id: '235',
    codigo: '235',
    nome: 'Perfume SONAREZA 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 2585,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 72.6,
  },
  {
    id: '240',
    codigo: '240',
    nome: 'Perfume SONOAR 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2640,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 73.8,
  },
  {
    id: '245',
    codigo: '245',
    nome: 'Perfume SONOAR 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 0,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 75.0,
  },
  {
    id: '250',
    codigo: '250',
    nome: 'Perfume SOFRENCIA 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2750,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 76.2,
  },
  {
    id: '255',
    codigo: '255',
    nome: 'Perfume SOFRENCIA 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 2805,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 77.4,
  },
  {
    id: '260',
    codigo: '260',
    nome: 'Perfume SOSENTE 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2860,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 78.6,
  },
  {
    id: '265',
    codigo: '265',
    nome: 'Perfume SOSENTE 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 2915,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 79.8,
  },
  {
    id: '270',
    codigo: '270',
    nome: 'Perfume SOREZANDO 50ml masculino',
    fornecedorId: 'FM001',
    estoqueAtual: 2970,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 81.0,
  },
  {
    id: '275',
    codigo: '275',
    nome: 'Perfume SOREZANDO 50ml feminino',
    fornecedorId: 'FF001',
    estoqueAtual: 1200,
    estoqueMinimo: 800,
    pontoReposicao: 1200,
    loteEconomico: 800,
    custoUnitario: 82.2,
  },
];

const pedidos = [
  {
    id: 'AUTO-115-FF001',
    fornecedorId: 'FF001' as const,
    data: '2026-04-10',
    tipo: 'Automático' as const,
    status: 'Realizado' as const,
    itens: [{ produtoId: '115', quantidade: 500 }],
  },
  {
    id: 'AUTO-155-FF001',
    fornecedorId: 'FF001' as const,
    data: '2026-04-12',
    tipo: 'Automático' as const,
    status: 'Realizado' as const,
    itens: [{ produtoId: '155', quantidade: 600 }],
  },
  {
    id: 'MAN-100-FM001',
    fornecedorId: 'FM001' as const,
    data: '2026-04-20',
    tipo: 'Manual' as const,
    status: 'Realizado' as const,
    itens: [
      { produtoId: '100', quantidade: 500 },
      { produtoId: '120', quantidade: 500 },
    ],
  },
  {
    id: 'AUTO-140-FM001',
    fornecedorId: 'FM001' as const,
    data: '2026-05-02',
    tipo: 'Automático' as const,
    status: 'Processando' as const,
    itens: [{ produtoId: '140', quantidade: 500 }],
  },
];

type ItemForm = {
  _key: string;
  produtoId: string;
  quantidade: number;
};

type PedidoForm = {
  fornecedor: string;
  data: string;
};

export default function Reposicao() {
  // Filtros da tabela
  const [pedidoFiltro, setPedidoFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  // Estado dos itens do formulário (multi-produto)
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

  // ─── Handlers do formulário ─────────────────────────────────────────────────

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

  const onSubmit = (data: PedidoForm) => {
    if (
      formItens.length === 0 ||
      formItens.some((i) => !i.produtoId || i.quantidade <= 0)
    )
      return;

    console.log({ ...data, itens: formItens });

    // Chamada da API aqui

    fecharModal();
  };

  const produtosAbaixoMinimo = useMemo(
    () => produtos.filter((p) => p.estoqueAtual < p.estoqueMinimo),
    []
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
  }, [pedidoFiltro, tipoFiltro, statusFiltro]);

  const formatarMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Custo total dos itens no formulário (preview em tempo real)
  const totalForm = formItens.reduce((acc, item) => {
    const produto = produtos.find((p) => p.id === item.produtoId);
    return acc + (produto?.custoUnitario ?? 0) * (item.quantidade || 0);
  }, 0);

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

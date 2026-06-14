import { Plus, X, Trash2 } from 'lucide-react';
import styles from './Reposicao.module.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePaginacao } from '../../hooks/usePaginacao';
import Paginacao from '../../components/paginacao/Paginacao';

// ─── Constantes ───────────────────────────────────────────────────────────────

const API = 'http://localhost:5125/api';
const HEADERS = { accept: 'application/json' };

const FORNECEDORES = [
  { id: 'FM001', nome: 'FORNMASC LTDA', genero: 'masculino' as const },
  { id: 'FF001', nome: 'FORNFEM LTDA', genero: 'feminino' as const },
];

// ─── Types da API ─────────────────────────────────────────────────────────────

type Genero = 'masculino' | 'feminino';

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

type Reposicao = {
  id: number;
  produtoId: number;
  fornecedorId: number;
  nrQuantidade: number;
  nrPrecounitario: string;
  nrDescontounitario: number;
  subtotal: number;
  tipo: string;
  flIsenable: boolean;
  // dtData será adicionada futuramente pela API
  dtData?: string;
};

type PedidoForm = {
  fornecedor: string;
  data: string;
};

type ItemForm = {
  _key: string;
  produtoId: string;
  quantidade: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGeneroProduto(produto?: Produto): Genero | null {
  if (!produto) return null;
  const desc = produto.txDescricao.toLowerCase();
  if (desc.includes('masculino')) return 'masculino';
  if (desc.includes('feminino')) return 'feminino';
  return null;
}

function getFornecedorPorGenero(genero: Genero | null) {
  return genero ? FORNECEDORES.find((f) => f.genero === genero) : undefined;
}

function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonTabelaAlerta() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <tr className={styles.text_only} key={i}>
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j}>
              <div className={styles.skeleton_text} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SkeletonTabelaPedidos() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr className={styles.text_only} key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j}>
              <div className={styles.skeleton_text} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Reposicao() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [reposicoes, setReposicoes] = useState<Reposicao[]>([]);
  const [loading, setLoading] = useState(true);

  const [formItens, setFormItens] = useState<ItemForm[]>([]);

  // Filtros
  const [pedidoFiltro, setPedidoFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PedidoForm>({
    defaultValues: {
      fornecedor: '',
      data: new Date().toISOString().split('T')[0],
    },
  });

  const fornecedorSelecionado = watch('fornecedor');

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resProdutos, resReposicoes] = await Promise.all([
          fetch(`${API}/Produtos`, { headers: HEADERS }),
          fetch(`${API}/Reposicoes`, { headers: HEADERS }),
        ]);
        const [dataProdutos, dataReposicoes] = await Promise.all([
          resProdutos.json(),
          resReposicoes.json(),
        ]);
        setProdutos(dataProdutos);
        setReposicoes(dataReposicoes);
      } catch (err) {
        console.error('Erro ao carregar reposição:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // ─── Form handlers ───────────────────────────────────────────────────────────

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
    valor: string | number,
  ) => {
    setFormItens((prev) =>
      prev.map((i) => (i._key === key ? { ...i, [campo]: valor } : i)),
    );

    if (campo === 'produtoId' && !fornecedorSelecionado) {
      const produto = produtos.find((p) => String(p.id) === String(valor));
      const fornecedor = getFornecedorPorGenero(getGeneroProduto(produto));
      if (fornecedor)
        setValue('fornecedor', fornecedor.id, { shouldValidate: true });
    }
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

  // ─── Dados derivados ─────────────────────────────────────────────────────────

  const produtosDisponiveis = useMemo(() => {
    const fornecedor = FORNECEDORES.find((f) => f.id === fornecedorSelecionado);
    if (!fornecedor) return produtos;
    return produtos.filter((p) => getGeneroProduto(p) === fornecedor.genero);
  }, [produtos, fornecedorSelecionado]);

  const produtosAbaixoMinimo = useMemo(
    () => produtos.filter((p) => p.nrEstoqueatual < p.nrEstoqueminimo),
    [produtos],
  );

  const reposicoesEnriquecidas = useMemo(() => {
    return reposicoes.map((reposicao) => {
      const produto = produtos.find((p) => p.id === reposicao.produtoId);
      const fornecedor = getFornecedorPorGenero(getGeneroProduto(produto));

      const tipo: 'Automático' | 'Manual' =
        reposicao.tipo === 'Manual' ? 'Manual' : 'Automático';
      const status: 'Realizado' | 'Processando' = reposicao.flIsenable
        ? 'Realizado'
        : 'Processando';

      return { reposicao, produto, fornecedor, tipo, status };
    });
  }, [reposicoes, produtos]);

  const reposicoesFiltradas = useMemo(() => {
    return reposicoesEnriquecidas.filter(
      ({ reposicao, fornecedor, tipo, status }) => {
        const matchBusca =
          pedidoFiltro === '' ||
          String(reposicao.id).includes(pedidoFiltro.toLowerCase()) ||
          fornecedor?.nome.toLowerCase().includes(pedidoFiltro.toLowerCase());

        const matchTipo = tipoFiltro === '' || tipo === tipoFiltro;
        const matchStatus = statusFiltro === '' || status === statusFiltro;

        return matchBusca && matchTipo && matchStatus;
      },
    );
  }, [reposicoesEnriquecidas, pedidoFiltro, tipoFiltro, statusFiltro]);

  const totalForm = formItens.reduce((acc, item) => {
    const produto = produtos.find((p) => String(p.id) === item.produtoId);
    return acc + (produto?.nrPrecocusto ?? 0) * (item.quantidade || 0);
  }, 0);

  // ─── Paginação ───────────────────────────────────────────────────────────────

  const pagAlerta = usePaginacao(produtosAbaixoMinimo);
  const pagPedidos = usePaginacao(reposicoesFiltradas);

  useMemo(() => pagPedidos.resetar(), [reposicoesFiltradas]);

  // ─── Render ──────────────────────────────────────────────────────────────────

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

      {/* ── Tabela: Produtos Abaixo do Mínimo ── */}
      {(loading || produtosAbaixoMinimo.length > 0) && (
        <section className={styles.table_container}>
          <div className={styles.table_header}>
            <h2>⚠️ Produtos Abaixo do Mínimo</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className="pseudo-title">Código</th>
                <th className="pseudo-title">Produto</th>
                <th className="pseudo-title">Estoque Atual</th>
                <th className="pseudo-title">Estoque Mínimo</th>
                <th className="pseudo-title">Fornecedor</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTabelaAlerta />
              ) : (
                pagAlerta.itensPagina.map((produto) => {
                  const fornecedor = getFornecedorPorGenero(
                    getGeneroProduto(produto),
                  );
                  return (
                    <tr className={styles.text_only} key={produto.id}>
                      <td>{produto.id}</td>
                      <td>{produto.txDescricao}</td>
                      <td>
                        <span className={styles.ruptura}>
                          {produto.nrEstoqueatual} un
                        </span>
                      </td>
                      <td>{produto.nrEstoqueminimo} un</td>
                      <td>{fornecedor?.id ?? '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {!loading && (
            <Paginacao
              paginaAtual={pagAlerta.paginaAtual}
              totalPaginas={pagAlerta.totalPaginas}
              total={produtosAbaixoMinimo.length}
              irPara={pagAlerta.irPara}
            />
          )}
        </section>
      )}

      {/* ── Modal: Novo Pedido ── */}
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
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione um fornecedor...
                </option>
                {FORNECEDORES.map((f) => (
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
                type="date"
                {...register('data', { required: 'Informe a data' })}
              />
              {errors.data && <span>{errors.data.message}</span>}
            </label>
          </div>

          <div className={styles.itens_header}>
            <span>Itens do Pedido</span>
            <button
              type="button"
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
                (p) => String(p.id) === item.produtoId,
              );
              const subtotal =
                (produtoSelecionado?.nrPrecocusto ?? 0) *
                (item.quantidade || 0);

              return (
                <div key={item._key} className={styles.item_linha}>
                  <select
                    value={item.produtoId}
                    onChange={(e) =>
                      atualizarLinha(item._key, 'produtoId', e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Selecione um produto...
                    </option>
                    {produtosDisponiveis.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.txDescricao} (Estoque: {p.nrEstoqueatual}{' '}
                        un)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qtd"
                    min={1}
                    value={item.quantidade || ''}
                    onChange={(e) =>
                      atualizarLinha(
                        item._key,
                        'quantidade',
                        Number(e.target.value),
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
            <button type="button" onClick={fecharModal}>
              Cancelar
            </button>
            <button type="submit">Registrar Pedido</button>
          </div>
        </form>
      </dialog>

      {/* ── Tabela: Pedidos de Reposição ── */}
      <section className={styles.table_container}>
        <div className={styles.table_header}>
          <h2>Pedidos de Reposição</h2>
          <div className={styles.filter_container_multiplerows}>
            <label>
              <input
                type="text"
                placeholder="Buscar pedido ou fornecedor..."
                value={pedidoFiltro}
                onChange={(e) => setPedidoFiltro(e.target.value)}
              />
            </label>
            <label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="Automático">Automático</option>
                <option value="Manual">Manual</option>
              </select>
            </label>
            <label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="Realizado">Realizado</option>
                <option value="Processando">Processando</option>
              </select>
            </label>
            <button
              type="button"
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
              <th className="pseudo-title">Pedido</th>
              <th className="pseudo-title">Fornecedor</th>
              <th className="pseudo-title">Data</th>
              <th className="pseudo-title">Tipo</th>
              <th className="pseudo-title">Produto</th>
              <th className="pseudo-title">Valor Total</th>
              <th className="pseudo-title">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTabelaPedidos />
            ) : (
              pagPedidos.itensPagina.map(
                ({ reposicao, produto, fornecedor, tipo, status }) => (
                  <tr className={styles.text_only} key={reposicao.id}>
                    <td>#{reposicao.id}</td>
                    <td>{fornecedor?.nome ?? '—'}</td>
                    <td>
                      {reposicao.dtData ? formatarData(reposicao.dtData) : '—'}
                    </td>
                    <td>
                      <span
                        className={
                          tipo === 'Automático'
                            ? styles.automatico
                            : styles.manual
                        }
                      />
                    </td>
                    <td className={styles.td_itens}>
                      <div>
                        {produto?.txDescricao ??
                          `Produto #${reposicao.produtoId}`}{' '}
                        — {reposicao.nrQuantidade} un
                      </div>
                    </td>
                    <td>{formatarMoeda(reposicao.subtotal)}</td>
                    <td>
                      <span
                        className={
                          status === 'Realizado'
                            ? styles.realizado
                            : styles.processando
                        }
                      />
                    </td>
                  </tr>
                ),
              )
            )}
            {!loading && reposicoesFiltradas.length === 0 && (
              <tr className={styles.text_only}>
                <td colSpan={7} className={styles.vazio}>
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && (
          <Paginacao
            paginaAtual={pagPedidos.paginaAtual}
            totalPaginas={pagPedidos.totalPaginas}
            total={reposicoesFiltradas.length}
            irPara={pagPedidos.irPara}
          />
        )}
      </section>
    </>
  );
}

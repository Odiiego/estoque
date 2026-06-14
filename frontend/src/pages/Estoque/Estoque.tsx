import { Package, Plus, X } from 'lucide-react';
import styles from './Estoque.module.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePaginacao } from '../../hooks/usePaginacao';
import Paginacao from '../../components/paginacao/Paginacao';

// ─── Types da API ─────────────────────────────────────────────────────────────

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

type Movimentacao = {
  id: number;
  produtoId: number;
  txTipo: 'entrada' | 'saida';
  nrQuantidade: number;
  dtMovimentacao: string; // ISO
  txOrigem: string;
  txUsuario: string;
};

type AjusteEstoqueForm = {
  produto: string;
  quantidade: number;
  data: string;
  origem: string;
  justificativa: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = 'http://localhost:5125/api';
const HEADERS = { accept: 'application/json' };

function getStatus(
  produto: Pick<Produto, 'nrEstoqueatual' | 'nrEstoqueminimo'>,
  pontoReposicao = produto.nrEstoqueminimo * 1.4,
) {
  if (produto.nrEstoqueatual === 0) return 'ruptura';
  if (produto.nrEstoqueatual <= produto.nrEstoqueminimo) return 'baixo';
  if (produto.nrEstoqueatual <= pontoReposicao) return 'atencao';
  return 'normal';
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SkeletonTabelaEstoque() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i}>
          <td>
            <div className={`${styles.img} ${styles.skeleton}`} />
          </td>
          {Array.from({ length: 6 }).map((_, j) => (
            <td key={j}>
              <div className={styles.skeleton_text} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SkeletonTabelaMovimentacoes() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr className={styles.text_only} key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
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

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(true);

  // Filtros — estoque
  const [produtoFiltro, setProdutoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  // Filtros — movimentações
  const [dataFiltro, setDataFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [origemFiltro, setOrigemFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AjusteEstoqueForm>({
    defaultValues: { data: new Date().toISOString().split('T')[0] },
  });

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await fetch(`${API}/Produtos`, { headers: HEADERS });
        setProdutos(await res.json());
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoadingProdutos(false);
      }
    }

    async function fetchMovimentacoes() {
      try {
        const res = await fetch(`${API}/Movimentacoes`, { headers: HEADERS });
        setMovimentacoes(await res.json());
      } catch (err) {
        console.error('Erro ao buscar movimentações:', err);
      } finally {
        setLoadingMovimentacoes(false);
      }
    }

    fetchProdutos();
    fetchMovimentacoes();
  }, []);

  // ─── Form ───────────────────────────────────────────────────────────────────

  const onSubmit = (data: AjusteEstoqueForm) => {
    console.log(data);
    // Chamada da API aqui
    reset();
    dialogRef.current?.close();
  };

  const fecharModal = () => {
    reset();
    dialogRef.current?.close();
  };

  // ─── Dados filtrados ─────────────────────────────────────────────────────────

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((p) => {
      const matchProduto =
        produtoFiltro === '' ||
        p.txDescricao.toLowerCase().includes(produtoFiltro.toLowerCase()) ||
        String(p.id).includes(produtoFiltro);

      const matchStatus = statusFiltro === '' || getStatus(p) === statusFiltro;

      return matchProduto && matchStatus;
    });
  }, [produtos, produtoFiltro, statusFiltro]);

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((m) => {
      const dataISO = m.dtMovimentacao.split('T')[0];

      let matchData = true;
      if (dataFiltro) matchData = dataISO === dataFiltro;
      else if (dataInicio && dataFim)
        matchData = dataISO >= dataInicio && dataISO <= dataFim;

      const matchOrigem = !origemFiltro || m.txOrigem === origemFiltro;
      const matchTipo = !tipoFiltro || m.txTipo === tipoFiltro;

      return matchData && matchOrigem && matchTipo;
    });
  }, [
    movimentacoes,
    dataFiltro,
    dataInicio,
    dataFim,
    origemFiltro,
    tipoFiltro,
  ]);

  // Opções dinâmicas dos selects de filtro
  const datasDisponiveis = useMemo(
    () =>
      [
        ...new Set(movimentacoes.map((m) => m.dtMovimentacao.split('T')[0])),
      ].sort(),
    [movimentacoes],
  );
  const origensDisponiveis = useMemo(
    () => [...new Set(movimentacoes.map((m) => m.txOrigem))].sort(),
    [movimentacoes],
  );

  // ─── Paginação ───────────────────────────────────────────────────────────────

  const pagEstoque = usePaginacao(produtosFiltrados);
  const pagMovimentacoes = usePaginacao(movimentacoesFiltradas);

  // Reseta páginas ao filtrar
  useMemo(() => pagEstoque.resetar(), [produtosFiltrados]);
  useMemo(() => pagMovimentacoes.resetar(), [movimentacoesFiltradas]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <section className={styles.header}>
        <div>
          <h1>Operações de Estoque</h1>
          <p>Gerencie ajustes de estoque</p>
        </div>
        <button onClick={() => dialogRef.current?.showModal()}>
          <Plus strokeWidth={4} size={22} />
          Ajuste
        </button>
      </section>

      {/* ── Tabela: Saldo por Produto ── */}
      <section className={styles.table_container}>
        <div className={styles.table_header}>
          <h2>Saldo Atual por Produto</h2>
          <div className={styles.filter_container}>
            <label>
              <input
                type="text"
                placeholder="Buscar produto ou código..."
                value={produtoFiltro}
                onChange={(e) => setProdutoFiltro(e.target.value)}
              />
            </label>
            <label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="normal">Normal</option>
                <option value="atencao">Atenção</option>
                <option value="baixo">Baixo</option>
                <option value="ruptura">Ruptura</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setProdutoFiltro('');
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
              <th className="pseudo-title">Imagem</th>
              <th className="pseudo-title">Código</th>
              <th className="pseudo-title">Produto</th>
              <th className="pseudo-title">Estoque Atual</th>
              <th className="pseudo-title">Estoque Mínimo</th>
              <th className="pseudo-title">Status</th>
              <th className="pseudo-title">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {loadingProdutos ? (
              <SkeletonTabelaEstoque />
            ) : (
              pagEstoque.itensPagina.map((produto) => (
                <tr key={produto.id}>
                  <td>
                    <div className={styles.img}>
                      <Package />
                    </div>
                  </td>
                  <td>{produto.id}</td>
                  <td>{produto.txDescricao}</td>
                  <td>{produto.nrEstoqueatual} un</td>
                  <td>{produto.nrEstoqueminimo} un</td>
                  <td>
                    <span className={styles[getStatus(produto)]} />
                  </td>
                  <td>
                    {formatarMoeda(
                      produto.nrEstoqueatual * produto.nrPrecocusto,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loadingProdutos && (
          <Paginacao
            paginaAtual={pagEstoque.paginaAtual}
            totalPaginas={pagEstoque.totalPaginas}
            total={produtosFiltrados.length}
            irPara={pagEstoque.irPara}
          />
        )}
      </section>

      {/* ── Modal: Ajuste de Estoque ── */}
      <dialog ref={dialogRef} className={styles.modal}>
        <div className={styles.modal_header}>
          <h2>Ajuste de Estoque</h2>
          <X size={20} className={styles.btn_close} onClick={fecharModal} />
        </div>

        <form
          onSubmit={() => handleSubmit(onSubmit)}
          className={styles.modal_form}
        >
          <label>
            Produto
            <select
              {...register('produto', { required: 'Selecione um produto' })}
              defaultValue=""
            >
              <option value="" disabled>
                Selecione um produto...
              </option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.txDescricao} (Estoque: {p.nrEstoqueatual} un)
                </option>
              ))}
            </select>
            {errors.produto && <span>{errors.produto.message}</span>}
          </label>

          <div className={styles.horizontal}>
            <label>
              Quantidade
              <input
                type="number"
                placeholder="Ex: -100, 20..."
                {...register('quantidade', {
                  required: 'Informe a quantidade',
                  valueAsNumber: true,
                })}
              />
              <span>Use positivo para adicionar ou negativo para remover</span>
              {errors.quantidade && <span>{errors.quantidade.message}</span>}
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

          <label>
            Origem
            <input
              type="text"
              placeholder="Ex: Compra, Transferência..."
              {...register('origem', { required: 'Informe a origem' })}
            />
            {errors.origem && <span>{errors.origem.message}</span>}
          </label>

          <label>
            Justificativa
            <textarea
              rows={3}
              placeholder="Descreva o motivo do ajuste"
              {...register('justificativa', {
                required: 'Informe a justificativa',
                minLength: {
                  value: 10,
                  message: 'A justificativa deve ter pelo menos 10 caracteres',
                },
              })}
            />
            {errors.justificativa && (
              <span>{errors.justificativa.message}</span>
            )}
          </label>

          <div className={styles.modal_footer}>
            <button type="button" onClick={fecharModal}>
              Cancelar
            </button>
            <button type="submit">Registrar Ajuste</button>
          </div>
        </form>
      </dialog>

      {/* ── Tabela: Histórico de Movimentações ── */}
      <section className={styles.table_container}>
        <div className={styles.table_header}>
          <h2>Histórico de Movimentações</h2>
          <div className={styles.filter_container_multiplerows}>
            <label>
              <select
                value={dataFiltro}
                onChange={(e) => {
                  setDataFiltro(e.target.value);
                  if (e.target.value) {
                    setDataInicio('');
                    setDataFim('');
                  }
                }}
              >
                <option value="">Todas as datas</option>
                {datasDisponiveis.map((d) => (
                  <option key={d} value={d}>
                    {d.split('-').reverse().join('/')}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setDataFiltro('');
                }}
              />
            </label>

            <label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setDataFiltro('');
                }}
              />
            </label>

            <label>
              <select
                value={origemFiltro}
                onChange={(e) => setOrigemFiltro(e.target.value)}
              >
                <option value="">Todas as origens</option>
                {origensDisponiveis.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos os tipos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setDataFiltro('');
                setDataInicio('');
                setDataFim('');
                setOrigemFiltro('');
                setTipoFiltro('');
              }}
            >
              Limpar filtros
            </button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th className="pseudo-title">Data/Hora</th>
              <th className="pseudo-title">Produto</th>
              <th className="pseudo-title">Tipo</th>
              <th className="pseudo-title">Quantidade</th>
              <th className="pseudo-title">Origem</th>
              <th className="pseudo-title">Usuário</th>
            </tr>
          </thead>
          <tbody>
            {loadingMovimentacoes ? (
              <SkeletonTabelaMovimentacoes />
            ) : (
              pagMovimentacoes.itensPagina.map((m) => {
                const produto = produtos.find((p) => p.id === m.produtoId);
                return (
                  <tr className={styles.text_only} key={m.id}>
                    <td>
                      {formatarData(m.dtMovimentacao)}{' '}
                      {formatarHora(m.dtMovimentacao)}
                    </td>
                    <td>{produto?.txDescricao ?? `Produto #${m.produtoId}`}</td>
                    <td>
                      <span
                        className={
                          m.txTipo === 'entrada' ? styles.entrada : styles.saida
                        }
                      />
                    </td>
                    <td>
                      {m.txTipo === 'entrada'
                        ? `+ ${m.nrQuantidade}`
                        : `- ${m.nrQuantidade}`}
                    </td>
                    <td>{m.txOrigem}</td>
                    <td>{m.txUsuario}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loadingMovimentacoes && (
          <Paginacao
            paginaAtual={pagMovimentacoes.paginaAtual}
            totalPaginas={pagMovimentacoes.totalPaginas}
            total={movimentacoesFiltradas.length}
            irPara={pagMovimentacoes.irPara}
          />
        )}
      </section>
    </>
  );
}

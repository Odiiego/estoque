/* eslint-disable react-hooks/refs */
import { Package, Plus, X } from 'lucide-react';
import styles from './Estoque.module.scss';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  pontoReposicao: number;
  custoUnitario: number;
};

type Movimentacao = {
  id: string;
  produtoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  hora: string;
  usuario: string;
  origem: string;
};

type AjusteEstoqueForm = {
  produto: string;
  quantidade: number;
  data: string;
  origem: string;
  justificativa: string;
};

const API_URL = 'https://sofragrancia-api-0qg4.onrender.com';

export default function Estoque() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  // Filtros da tabela de estoque
  const [produtoFiltro, setProdutoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  // Filtros da tabela de movimentações
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [origemFiltro, setOrigemFiltro] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AjusteEstoqueForm>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  });

  // Busca inicial dos dados
  useEffect(() => {
    fetch(`${API_URL}/produtos`)
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error('Erro ao buscar produtos:', err));

    fetch(`${API_URL}/movimentacoes`)
      .then((res) => res.json())
      .then((data) => setMovimentacoes(data))
      .catch((err) => console.error('Erro ao buscar movimentacoes:', err));
  }, []);

  const onSubmit = (data: AjusteEstoqueForm) => {
    const payload = {
      produtoId: data.produto,
      quantidade: Math.abs(data.quantidade),
      tipo: data.quantidade > 0 ? 'entrada' : 'saida',
      data: data.data,
      hora: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      origem: data.origem,
      usuario: 'admin',
      justificativa: data.justificativa,
    };

    fetch(`${API_URL}/movimentacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((novaMovimentacao) => {
        setMovimentacoes((prev) => [...prev, novaMovimentacao]);

        // Atualiza o estado local do produto sincronizando com a operação realizada
        setProdutos((prevProdutos) =>
          prevProdutos.map((p) =>
            p.id === data.produto
              ? { ...p, estoqueAtual: p.estoqueAtual + data.quantidade }
              : p
          )
        );
      })
      .catch((err) => console.error('Erro ao registrar ajuste:', err));

    reset();
    dialogRef.current?.close();
  };

  const getStatus = (produto: Produto) => {
    if (produto.estoqueAtual === 0) return 'ruptura';
    if (produto.estoqueAtual <= produto.estoqueMinimo) return 'baixo';
    if (produto.estoqueAtual <= produto.pontoReposicao) return 'atencao';
    return 'normal';
  };

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const matchProduto =
        produtoFiltro === '' ||
        produto.nome.toLowerCase().includes(produtoFiltro.toLowerCase()) ||
        produto.codigo.includes(produtoFiltro);

      const matchStatus =
        statusFiltro === '' || getStatus(produto) === statusFiltro;

      return matchProduto && matchStatus;
    });
  }, [produtos, produtoFiltro, statusFiltro]);

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((movimentacao) => {
      let matchData = true;

      if (dataInicio && dataFim) {
        matchData =
          movimentacao.data >= dataInicio && movimentacao.data <= dataFim;
      } else if (dataInicio) {
        matchData = movimentacao.data >= dataInicio;
      } else if (dataFim) {
        matchData = movimentacao.data <= dataFim;
      }

      const matchOrigem = !origemFiltro || movimentacao.origem === origemFiltro;
      const matchUsuario =
        !usuarioFiltro || movimentacao.usuario === usuarioFiltro;
      const matchTipo = !tipoFiltro || movimentacao.tipo === tipoFiltro;

      return matchData && matchOrigem && matchUsuario && matchTipo;
    });
  }, [
    movimentacoes,
    dataInicio,
    dataFim,
    origemFiltro,
    usuarioFiltro,
    tipoFiltro,
  ]);

  const origensDisponiveis = useMemo(
    () => [...new Set(movimentacoes.map((m) => m.origem))].sort(),
    [movimentacoes]
  );
  const tiposDisponiveis = useMemo(
    () => [...new Set(movimentacoes.map((m) => m.tipo))],
    [movimentacoes]
  );
  const usuariosDisponiveis = useMemo(
    () => [...new Set(movimentacoes.map((m) => m.usuario))].sort(),
    [movimentacoes]
  );

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

      <section className={styles.table_container}>
        <div className={styles.table_header}>
          <h2>Saldo Atual por Produto</h2>
          <div className={styles.filter_container}>
            <label>
              <input
                type='text'
                placeholder='Buscar produto ou código...'
                value={produtoFiltro}
                onChange={(e) => setProdutoFiltro(e.target.value)}
              />
            </label>
            <label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
              >
                <option value=''>Todos os status</option>
                <option value='normal'>Normal</option>
                <option value='atencao'>Atenção</option>
                <option value='baixo'>Baixo</option>
                <option value='ruptura'>Ruptura</option>
              </select>
            </label>
            <button
              type='button'
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
              <th className='pseudo-title'>Imagem</th>
              <th className='pseudo-title'>Código</th>
              <th className='pseudo-title'>Produto</th>
              <th className='pseudo-title'>Estoque Atual</th>
              <th className='pseudo-title'>Estoque Mínimo</th>
              <th className='pseudo-title'>Status</th>
              <th className='pseudo-title'>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((produto) => (
              <tr key={produto.codigo}>
                <td>
                  <div className={styles.img}>
                    <Package />
                  </div>
                </td>
                <td>{produto.codigo}</td>
                <td>{produto.nome}</td>
                <td>{produto.estoqueAtual} un</td>
                <td>{produto.estoqueMinimo} un</td>
                <td>
                  <span className={styles[getStatus(produto)]}></span>
                </td>
                <td>
                  {(
                    produto.estoqueAtual * produto.custoUnitario
                  ).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <dialog ref={dialogRef} className={styles.modal}>
        <div className={styles.modal_header}>
          <h2>Ajuste de Estoque</h2>
          <X
            size={20}
            className={styles.btn_close}
            onClick={() => {
              reset();
              dialogRef.current?.close();
            }}
          />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.modal_form}>
          <label>
            Produto
            <select
              {...register('produto', { required: 'Selecione um produto' })}
              defaultValue=''
            >
              <option value='' disabled>
                Selecione um produto...
              </option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.codigo} - {produto.nome} (Estoque:{' '}
                  {produto.estoqueAtual} un)
                </option>
              ))}
            </select>
          </label>

          <div className={styles.horizontal}>
            <label>
              Quantidade
              <input
                type='number'
                placeholder='Ex: -100, 20...'
                {...register('quantidade', {
                  required: 'Informe a quantidade',
                  valueAsNumber: true,
                })}
              />
              <span>
                Use valores positivos para adicionar ou negativos para remover
              </span>
              {errors.quantidade && <span>{errors.quantidade.message}</span>}
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

          <label>
            Origem
            <input
              type='text'
              placeholder='Ex: Compra, Transferência...'
              {...register('origem', { required: 'Informe a origem' })}
            />
            {errors.origem && <span>{errors.origem.message}</span>}
          </label>

          <label>
            Justificativa
            <textarea
              rows={3}
              placeholder='Descreva o motivo do ajuste'
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
            <button
              type='button'
              onClick={() => {
                reset();
                dialogRef.current?.close();
              }}
            >
              Cancelar
            </button>
            <button type='submit'>Registrar Ajuste</button>
          </div>
        </form>
      </dialog>

      <section className={styles.table_container}>
        <div className={styles.table_header}>
          <h2>Histórico de Movimentações</h2>
          <div className={styles.filter_container_multiplerows}>
            <label>
              De:
              <input
                type='date'
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </label>

            <label>
              Até:
              <input
                type='date'
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </label>

            <label>
              <select
                value={origemFiltro}
                onChange={(e) => setOrigemFiltro(e.target.value)}
              >
                <option value=''>Todas as origens</option>
                {origensDisponiveis.map((origem) => (
                  <option key={origem} value={origem}>
                    {origem}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <select
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(e.target.value)}
              >
                <option value=''>Todos os usuários</option>
                {usuariosDisponiveis.map((usuario) => (
                  <option key={usuario} value={usuario}>
                    {usuario}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value=''>Todos os tipos</option>
                {tiposDisponiveis.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </option>
                ))}
              </select>
            </label>

            <button
              type='button'
              onClick={() => {
                setDataInicio('');
                setDataFim('');
                setOrigemFiltro('');
                setUsuarioFiltro('');
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
              <th className='pseudo-title'>Data/Hora</th>
              <th className='pseudo-title'>Produto</th>
              <th className='pseudo-title'>Tipo</th>
              <th className='pseudo-title'>Quantidade</th>
              <th className='pseudo-title'>Origem</th>
              <th className='pseudo-title'>Usuário</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoesFiltradas.map((movimentacao) => (
              <tr className={styles.text_only} key={movimentacao.id}>
                <td>
                  {movimentacao.data.split('-').reverse().join('/')}{' '}
                  {movimentacao.hora}
                </td>
                <td>
                  {produtos.find((p) => p.id === movimentacao.produtoId)
                    ?.nome ?? movimentacao.produtoId}
                </td>
                <td>
                  <span
                    className={
                      movimentacao.tipo === 'entrada'
                        ? styles.entrada
                        : styles.saida
                    }
                  ></span>
                </td>
                <td>
                  {movimentacao.tipo === 'entrada'
                    ? `+ ${movimentacao.quantidade}`
                    : `- ${movimentacao.quantidade}`}
                </td>
                <td>{movimentacao.origem}</td>
                <td>{movimentacao.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

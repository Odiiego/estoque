import styles from './Paginacao.module.scss';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  total: number;
  irPara: (p: number) => void;
}

export default function Paginacao({
  paginaAtual,
  totalPaginas,
  total,
  irPara,
}: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  const ITENS_POR_PAGINA = 15;
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA + 1;
  const fim = Math.min(paginaAtual * ITENS_POR_PAGINA, total);

  // Gera os números de página visíveis (máx 5, com reticências)
  function paginas(): (number | '...')[] {
    if (totalPaginas <= 5) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    const resultado: (number | '...')[] = [1];

    if (paginaAtual > 3) resultado.push('...');

    const inicio = Math.max(2, paginaAtual - 1);
    const fim = Math.min(totalPaginas - 1, paginaAtual + 1);

    for (let i = inicio; i <= fim; i++) resultado.push(i);

    if (paginaAtual < totalPaginas - 2) resultado.push('...');

    resultado.push(totalPaginas);

    return resultado;
  }

  return (
    <div className={styles.paginacao}>
      <span className={styles.info}>
        {inicio}–{fim} de {total}
      </span>

      <div className={styles.controles}>
        <button
          onClick={() => irPara(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {paginas().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.reticencias}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => irPara(p)}
              className={paginaAtual === p ? styles.ativo : ''}
              aria-current={paginaAtual === p ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => irPara(paginaAtual + 1)}
          disabled={paginaAtual === totalPaginas}
          aria-label="Próxima página"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

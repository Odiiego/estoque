import { useMemo, useState } from 'react';

const ITENS_POR_PAGINA = 15;

export function usePaginacao<T>(itens: T[]) {
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(itens.length / ITENS_POR_PAGINA));

  // Volta pra página 1 se a lista mudar e a página atual virar inválida
  const paginaAtual = Math.min(pagina, totalPaginas);

  const itensPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return itens.slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [itens, paginaAtual]);

  function irPara(p: number) {
    setPagina(Math.max(1, Math.min(p, totalPaginas)));
  }

  // Reinicia sempre que a lista mudar (ex: filtros aplicados)
  function resetar() {
    setPagina(1);
  }

  return { itensPagina, paginaAtual, totalPaginas, irPara, resetar };
}

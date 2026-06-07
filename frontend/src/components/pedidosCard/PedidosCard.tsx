import styles from './PedidosCard.module.scss';
import { FiBox } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';

interface PedidosCardProps {
  id: string;
  numeroPedido: string;
  data: string;
  cliente: string;
  nomeProduto: string;
  quantidade: number;
  vendedor: string;
}

export default function PedidosCard(props: PedidosCardProps) {
  const dataFormatada = props.data.includes('-')
    ? props.data.split('-').reverse().join('/')
    : props.data;

  return (
    <>
      <article className={styles.container}>
        <span className={styles.id}>Item ID: {props.id}</span>

        <span className={styles.dataPedido}>{dataFormatada}</span>

        <FiBox />

        <h3 className={styles.nome} title={`Cliente: ${props.cliente}`}>
          {props.cliente}
        </h3>

        <p className={styles.nomeProduto}>{props.nomeProduto}</p>

        <p className={styles.qtdPedida}>
          <span>Qtd: </span>
          {props.quantidade} un
        </p>

        <p className={styles.vendedor}>
          <IoPerson />
          Vendedor: {props.vendedor}
        </p>
      </article>
    </>
  );
}

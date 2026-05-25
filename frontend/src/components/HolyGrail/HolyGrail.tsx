import { Route, Routes } from 'react-router-dom';
import styles from './HolyGrail.module.scss';
import Header from '../Header/Header';
import Estoque from '../../pages/Estoque/Estoque';
import Pedidos from '../../pages/Pedidos';
import Reposicao from '../../pages/Reposicao';
import Dashboard from '../../pages/Dashboard/Dashboard';
import Menu from '../Menu/Menu';
import Home from '../../pages/Home';

export default function HolyGrail() {
  return (
    <div className={styles.HolyGrail}>
      <Header />
      <Menu />

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/reposicao" element={<Reposicao />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

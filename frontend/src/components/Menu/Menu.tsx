import {
  ArrowDownUp,
  ChartColumn,
  House,
  ShoppingCart,
  UsersRound,
} from 'lucide-react';

import styles from './Menu.module.scss';

import { NavLink } from 'react-router-dom';

export default function Menu() {
  return (
    <nav className={styles.menu}>
      <ul>
        <p className="pseudo-title">Menu Principal</p>

        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            <House size={20} />
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/estoque"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            <ArrowDownUp size={20} />
            Estoque
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/pedidos"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            <ShoppingCart size={20} />
            Pedidos
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/reposicao"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            <UsersRound size={20} />
            Reposição
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            <ChartColumn size={20} />
            Dashboard
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

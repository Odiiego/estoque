import UserCard from '../UserCard/UserCard';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <p>
        Sofra<span>grância</span>
      </p>
      <UserCard />
    </header>
  );
}

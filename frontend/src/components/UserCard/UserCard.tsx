import { User } from 'lucide-react';
import styles from './UserCard.module.scss';

export default function UserCard() {
  return (
    <div className={styles.user_card}>
      <User color='white' className={styles.user_icon} size={40} />
      <span className={styles.user_info}>
        <span>Admin</span>
        <span>Gerente</span>
      </span>
    </div>
  );
}

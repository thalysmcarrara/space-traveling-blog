import Image from 'next/image';
import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`${commonStyles.maxWidth} ${styles.headerContent}`}>
        <Link href="/">
          <a>
            <Image src="/logo.svg" alt="logo" width={240} height={26} />
          </a>
        </Link>
      </div>
    </header>
  );
}

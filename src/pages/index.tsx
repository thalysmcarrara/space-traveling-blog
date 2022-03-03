import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { ReactElement, useState } from 'react';
import * as Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const { results, next_page } = postsPagination;
  const [nextPageLink, setNextPageLink] = useState(next_page);
  const [posts, setPosts] = useState(results);

  const handleClickNextPage = async () => {
    const next_posts = await fetch(nextPageLink)
      .then(response => response.json())
      .then(res => res);

    setNextPageLink(next_posts.next_page);
    setPosts(next_posts.results);
  };

  return (
    <>
      <Head>
        <title>SpaceTraveling</title>
      </Head>
      <main className={commonStyles.maxWidth}>
        <ul className={styles.posts}>
          {posts.map(({ data, uid, first_publication_date }) => (
            <li key={uid}>
              <Link href={`/post/${uid}`}>
                <strong className={styles.title}>{data.title}</strong>
              </Link>
              <p className={styles.subtitle}>{data.subtitle}</p>
              <div className={styles.infoContainer}>
                <div className={styles.infoContent}>
                  <FiCalendar />
                  <time className={styles.infoText}>
                    {format(new Date(first_publication_date), 'd MMM yyy', {
                      locale: ptBR,
                    })}
                  </time>
                </div>
                <div className={styles.infoContent}>
                  <FiUser />
                  <span className={styles.infoText}>{data.author}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {nextPageLink && (
          <button
            className={styles.buttonNext}
            onClick={handleClickNextPage}
            type="button"
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.get({
    predicates: Prismic.predicate.at('document.type', 'post'),
    pageSize: 2,
  });

  const { next_page, results } = postsResponse;

  return {
    props: {
      postsPagination: { next_page, results },
    },
    revalidate: 60 * 60 * 24, // 24hrs
  };
};

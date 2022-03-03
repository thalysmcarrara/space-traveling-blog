import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import * as Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const {
    data: { author, banner, content, title },
    first_publication_date,
  } = post;

  const { isFallback } = useRouter();

  const calculateTimeRead = (acc, paragraphs) => {
    const countWords = paragraphs.body.reduce(
      (charCount, paragraph) => paragraph.text.split(' ').length + charCount,
      0
    );

    return acc + countWords;
  };

  const readTime = Math.ceil(content.reduce(calculateTimeRead, 0) / 200);

  return (
    <>
      {isFallback ? (
        <h1 className={styles.loading}>Carregando...</h1>
      ) : (
        <>
          <div className={styles.bannerContainer}>
            <img src={banner.url} alt={banner.alt} />
          </div>
          <main className={`${commonStyles.maxWidth} ${styles.mainContainer}`}>
            <h1>{title}</h1>
            <div className={styles.infoContainer}>
              <div className={styles.infoContent}>
                <FiCalendar />
                <time className={styles.infoText}>
                  {format(new Date(first_publication_date), 'd MMM y', {
                    locale: ptBR,
                  })}
                </time>
              </div>
              <div className={styles.infoContent}>
                <FiUser />
                <span className={styles.infoText}>{author}</span>
              </div>
              <div className={styles.infoContent}>
                <FiClock />
                <span className={styles.infoText}>{readTime} min</span>
              </div>
            </div>
            <div className={styles.postContent}>
              {content.map((paragraph, index) => {
                return (
                  <div key={index}>
                    <h2>{paragraph.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(paragraph.body),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </main>
        </>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const prismic = getPrismicClient();
    const posts = await prismic.get({
      predicates: Prismic.predicate.at('document.type', 'post'),
    });

    return {
      paths: posts.results.map(post => {
        return {
          params: {
            slug: post.uid,
          },
        };
      }),

      fallback: false,
    };
  } catch {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async context => {
  try {
    const prismic = getPrismicClient();
    const { params } = context;

    const response = await prismic.getByUID('post', String(params.slug));

    const { first_publication_date, data, uid } = response;
    return {
      props: {
        post: { uid, first_publication_date, data },
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
